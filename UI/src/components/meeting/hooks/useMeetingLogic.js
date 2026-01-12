import { useCallback } from 'react';
import { joinMeeting, leaveMeeting as leaveMeetingAPI } from '../../../services/apiService';
import { io } from 'socket.io-client';
import { useNotifications } from '../../../hooks/useNotifications';

export const useMeetingLogic = (state, meetingId, webRTC, mediaControls) => {
  const {
    userId, setUserId, userName, setUserName, setIsHost, setParticipants,
    setParticipantNames, setMessages, localStreamRef, socketRef, peerConnectionsRef,
    remoteVideosRef, audioContextRef, setJoinWithoutMedia, setStreamReady
  } = state;

  const {
    notifyMeetingJoined, notifyUserJoined, notifyUserLeft, notifyMeetingLeft,
    notifyMeetingError, confirmLeaveMeeting, showError
  } = useNotifications();

  // Initialize WebRTC
  const initWebRTC = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia is not supported in this browser');
      }

      const constraints = {
        video: {
          width: { min: 320, ideal: 1280, max: 1920 },
          height: { min: 240, ideal: 720, max: 1080 },
          facingMode: 'user',
          frameRate: { ideal: 30, max: 60 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1,
          volume: 1.0
        }
      };

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (constraintError) {
        console.warn('Failed with preferred constraints, trying simpler constraints:', constraintError);
        const simpleConstraints = { video: true, audio: true };
        stream = await navigator.mediaDevices.getUserMedia(simpleConstraints);
      }

      localStreamRef.current = stream;

      if (state.localVideoRef.current) {
        state.localVideoRef.current.srcObject = stream;
        state.localVideoRef.current.onloadedmetadata = () => {
          state.localVideoRef.current.play().catch(console.error);
        };
      }

      // Setup audio level monitoring
      if (webRTC.setupAudioLevelMonitoring) {
        webRTC.setupAudioLevelMonitoring(stream);
      }

      console.log('Successfully initialized WebRTC with stream');
      setStreamReady(true);

    } catch (error) {
      console.error('Error accessing media devices:', error);
      handleMediaError(error);
    }
  }, [localStreamRef, state.localVideoRef, webRTC, setStreamReady]);

  // Handle media errors
  const handleMediaError = useCallback((error) => {
    if (error.name === 'NotAllowedError') {
      showError('Camera/microphone access was denied. Please enable permissions and refresh the page.');
    } else if (error.name === 'NotFoundError') {
      showError('No camera/microphone found. Please connect a device and refresh the page.');
    } else if (error.name === 'NotSupportedError') {
      showError('Your browser does not support camera/microphone access. Please try Chrome, Firefox, or Edge.');
    } else {
      showError('Could not access camera/microphone. Please check permissions and try again.');
    }
  }, [showError]);

  // Check and request permissions
  const checkAndRequestPermissions = useCallback(async () => {
    try {
      if (navigator.permissions) {
        const cameraPermission = await navigator.permissions.query({ name: 'camera' });
        const microphonePermission = await navigator.permissions.query({ name: 'microphone' });

        if (cameraPermission.state === 'denied' || microphonePermission.state === 'denied') {
          showError('Camera/microphone permissions were denied. Please enable them in your browser settings and refresh.');
          return false;
        }
      }
      return true;
    } catch (error) {
      console.warn('Permission check failed, proceeding anyway:', error);
      return true;
    }
  }, [showError]);

  // Initialize meeting
  const initializeMeeting = useCallback(async () => {
    try {
      // Get or create user ID with session persistence
      let storedUserId = localStorage.getItem('userId') || localStorage.getItem('guestUserId') || sessionStorage.getItem('guestUserId') || '';
      let storedUserName = localStorage.getItem('userName') || '';

      setUserId(storedUserId);
      setUserName(storedUserName || 'Guest User');

      // Join the meeting with retry logic for concurrency issues
      let retries = 3;
      let data = null;
      
      while (retries > 0) {
        try {
          data = await joinMeeting(meetingId, storedUserId);
          break; // Success, exit retry loop
        } catch (error) {
          if (error.message.includes('concurrency') || error.message.includes('version') || retries === 1) {
            // If it's a concurrency error and we have retries left, or if it's the last retry
            if (retries === 1) {
              throw error; // Last retry failed, throw the error
            }
            console.log(`Concurrency error, retrying... (${retries - 1} attempts left)`);
            retries--;
            // Wait a random time before retrying
            await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));
          } else {
            throw error; // Non-concurrency error, throw immediately
          }
        }
      }

      if (data && data.meeting) {
        setIsHost(data.isHost || false);

        if (data.userId) {
          if (!localStorage.getItem('userId')) {
            sessionStorage.setItem('guestUserId', data.userId);
          }

          if (data.userId !== storedUserId) {
            setUserId(data.userId);
            storedUserId = data.userId;
          }
        }

        notifyMeetingJoined(meetingId);
      }

      // Connect to WebSocket server
      const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
      socketRef.current = socket;

      // Join the meeting room with user ID and name
      socket.emit('join-meeting', { 
        meetingId, 
        userId: storedUserId,
        userName: storedUserName
      });

      // Setup socket event listeners
      setupSocketListeners(socket, storedUserId);

      // Check permissions and initialize WebRTC
      const permissionsOk = await checkAndRequestPermissions();
      
      if (permissionsOk && !state.joinWithoutMedia) {
        await initWebRTC();
      } else if (state.joinWithoutMedia) {
        console.log('Joining without media as requested by user');
      } else {
        console.warn('Permissions not granted, user can still join without media');
        setJoinWithoutMedia(true);
      }

    } catch (error) {
      console.error('Error joining meeting:', error);
      
      // Show user-friendly error messages
      if (error.message.includes('Meeting not found')) {
        showError('Meeting not found. Please check the meeting ID and try again.');
      } else if (error.message.includes('concurrency')) {
        showError('The meeting is very busy right now. Please try again in a moment.');
      } else {
        showError('Failed to join meeting. Please check the meeting ID and try again.');
      }
    }
  }, [meetingId, setUserId, setUserName, setIsHost, socketRef, notifyMeetingJoined, 
      checkAndRequestPermissions, initWebRTC, state.joinWithoutMedia, setJoinWithoutMedia, showError]);

  // Setup socket event listeners
  const setupSocketListeners = useCallback((socket, currentUserId) => {
    // Handle existing participants
    socket.on('existing-participants', (existingParticipants) => {
      console.log('Existing participants:', existingParticipants);

      existingParticipants.forEach(participantData => {
        const participantId = participantData.userId || participantData;
        const participantName = participantData.userName || 'Guest User';
        
        if (participantId !== currentUserId && !peerConnectionsRef.current[participantId]) {
          console.log('Creating connection to existing participant:', participantId, participantName);
          webRTC.createPeerConnection(participantId);
          
          setParticipantNames(prev => ({
            ...prev,
            [participantId]: participantName
          }));
        }
      });

      const participantIds = existingParticipants.map(p => p.userId || p).filter(id => id && id !== currentUserId);
      setParticipants(prev => {
        const newSet = new Set(prev.map(String));
        participantIds.forEach(participantId => {
          if (participantId) {
            newSet.add(String(participantId));
          }
        });
        return Array.from(newSet);
      });
    });

    // Handle incoming chat messages
    socket.on('chat-message', (message) => {
      if (message.userId !== currentUserId) {
        setMessages(prevMessages => {
          const messageExists = prevMessages.some(msg => msg.id === message.id);
          if (!messageExists) {
            return [...prevMessages, message];
          }
          return prevMessages;
        });
      }
    });

    // Handle user joined events
    socket.on('user-joined', (joinedUserData) => {
      console.log('User joined:', joinedUserData);

      const joinedUserId = joinedUserData.userId || joinedUserData;
      const joinedUserName = joinedUserData.userName || 'Guest User';

      if (joinedUserId !== currentUserId && !peerConnectionsRef.current[joinedUserId]) {
        setParticipantNames(prev => ({
          ...prev,
          [joinedUserId]: joinedUserName
        }));

        notifyUserJoined(joinedUserName);
        webRTC.createPeerConnection(joinedUserId);

        setParticipants(prev => {
          const newSet = new Set(prev.map(String));
          if (joinedUserId && joinedUserId !== currentUserId) {
            newSet.add(String(joinedUserId));
          }
          return Array.from(newSet);
        });
      }
    });

    // Handle WebRTC signaling
    socket.on('webrtc-signal', async (data) => {
      if (data.senderId !== currentUserId) {
        await webRTC.handleWebRTCSignal(data);
      }
    });

    // Handle user left events
    socket.on('user-left', (leftUserData) => {
      console.log('User left:', leftUserData);

      const leftUserId = leftUserData.userId || leftUserData;
      const leftUserName = leftUserData.userName || state.participantNames[leftUserId] || 'Guest User';

      notifyUserLeft(leftUserName);

      setParticipants(prev => prev.filter(p => p !== leftUserId));

      setParticipantNames(prev => {
        const newNames = { ...prev };
        delete newNames[leftUserId];
        return newNames;
      });

      webRTC.cleanupPeerConnection(leftUserId);
    });

    // Handle incoming reactions (for FloatingReactions component)
    socket.on('reaction-received', (reactionData) => {
      if (reactionData.userId !== currentUserId && state.setReactions) {
        // Ensure the reaction has an emoji property
        const reaction = {
          id: reactionData.id || Date.now(),
          userId: reactionData.userId,
          emoji: reactionData.emoji || reactionData.reaction || '👍',
          timestamp: reactionData.timestamp || Date.now()
        };
        state.setReactions(prev => [...prev, reaction]);
        
        // Remove reaction after 3 seconds
        setTimeout(() => {
          state.setReactions(prev => prev.filter(r => r.id !== reaction.id));
        }, 3000);
      }
    });

  }, [webRTC, setParticipants, setParticipantNames, setMessages, peerConnectionsRef, 
      notifyUserJoined, notifyUserLeft, state.participantNames, state.setReactions]);

  // Send message
  const sendMessage = useCallback(() => {
    if (state.newMessage.trim() && userId) {
      const message = {
        id: Date.now().toString(),
        userId,
        userName: userName,
        text: state.newMessage,
        timestamp: Date.now(),
        meetingId
      };

      if (socketRef.current) {
        socketRef.current.emit('chat-message', message);
      }

      setMessages(prevMessages => [...prevMessages, message]);
      state.setNewMessage('');
    }
  }, [state.newMessage, userId, userName, meetingId, socketRef, setMessages, state.setNewMessage]);

  // Leave meeting
  const leaveMeeting = useCallback(async () => {
    confirmLeaveMeeting(async () => {
      try {
        await leaveMeetingAPI(meetingId, userId);

        // Cleanup
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach(track => track.stop());
        }

        Object.values(peerConnectionsRef.current).forEach(pc => pc.close());

        notifyMeetingLeft();

        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
        
      } catch (error) {
        console.error('Error leaving meeting:', error);
        notifyMeetingError('leave meeting');
        
        // Still cleanup and redirect even if API call fails
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach(track => track.stop());
        }
        Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
        
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      }
    });
  }, [meetingId, userId, localStreamRef, peerConnectionsRef, confirmLeaveMeeting, 
      notifyMeetingLeft, notifyMeetingError]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    Object.values(peerConnectionsRef.current).forEach(pc => {
      pc.close();
    });
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  }, [localStreamRef, peerConnectionsRef, socketRef, audioContextRef]);

  return {
    initializeMeeting,
    sendMessage,
    leaveMeeting,
    cleanup
  };
};