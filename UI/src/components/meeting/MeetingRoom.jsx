import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { joinMeeting, leaveMeeting } from '../../services/apiService';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaDesktop, FaPhone, FaUsers, FaComment, FaClock, FaUser } from 'react-icons/fa';
import { io } from 'socket.io-client';
import { useNotifications } from '../../hooks/useNotifications';

const MeetingRoom = () => {
  const { meetingId } = useParams();
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [participants, setParticipants] = useState([]);
  const [participantNames, setParticipantNames] = useState({}); // Store participant names
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [mediaPermissions, setMediaPermissions] = useState({
    camera: 'unknown',
    microphone: 'unknown'
  });
  const [joinWithoutMedia, setJoinWithoutMedia] = useState(false);

  const localVideoRef = useRef(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const remoteVideosRef = useRef({});
  const peerConnectionsRef = useRef({});
  const localStreamRef = useRef(null);
  const socketRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioAnalyserRef = useRef(null);
  
  const {
    notifyMeetingJoined,
    notifyUserJoined,
    notifyUserLeft,
    notifyMediaEnabled,
    notifyMeetingLeft,
    notifyMeetingError,
    notifyPermissionDenied,
    notifyConnectionIssue,
    confirmLeaveMeeting,
    showError,
    showWarning,
    showSuccess,
    showInfo
  } = useNotifications();

  // Initialize WebRTC and socket connection
  useEffect(() => {
    const initMeeting = async () => {
      try {
        // Get or create user ID with session persistence
        let storedUserId = localStorage.getItem('userId') || localStorage.getItem('guestUserId') || sessionStorage.getItem('guestUserId') || '';
        let storedUserName = localStorage.getItem('userName') || '';

        // Check localStorage (authenticated) first, then sessionStorage (guest)
        // If storedUserId is empty, we send empty to server to get a new guest ID
        if (!storedUserId) {
          // Also check sessionStorage just in case line 28 didn't catch it if logic changes
          storedUserId = sessionStorage.getItem('guestUserId') || '';
        }

        // We no longer generate client-side guest IDs ('guest-...') because they are incompatible with MongoDB
        // Instead, we let the server assign a valid ObjectId for guests

        setUserId(storedUserId);
        setUserName(storedUserName || 'Guest User');

        // Join the meeting
        const data = await joinMeeting(meetingId, storedUserId);
        if (data && data.meeting) {
          // Filter out duplicate participants and the current user
          const uniqueParticipants = Array.from(new Set(data.meeting.participants.map(p => p.toString())))
            .map(id => data.meeting.participants.find(p => p.toString() === id))
            .filter(p => p.toString() !== storedUserId.toString()); // Remove current user from the list

          console.log('Meeting info received. Waiting for socket to sync active participants...');
          // We DO NOT set active participants from the DB anymore because it might contain stale users.
          // We wait for 'existing-participants' socket event to tell us who is actually online.

          if (data.userId) {
            // Use session storage for guest users to maintain consistency across refreshes
            if (!localStorage.getItem('userId')) { // Only for guest users
              sessionStorage.setItem('guestUserId', data.userId);
            }

            // Only update user ID if it's different from what we have
            if (data.userId !== storedUserId) {
              setUserId(data.userId);
              storedUserId = data.userId;
            }
          }

          // Show success notification
          notifyMeetingJoined(meetingId);

          // Log whether this was a new participant or existing
          if (data.isNewParticipant) {
            console.log('New participant joined:', storedUserId);
          } else {
            console.log('Existing participant reconnected:', storedUserId);
          }
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

        // When we join, create connections to existing participants
        socket.on('existing-participants', (existingParticipants) => {
          console.log('Existing participants:', existingParticipants);

          // existingParticipants is now an array of {userId, userName} objects
          existingParticipants.forEach(participantData => {
            const participantId = participantData.userId || participantData; // Handle both old and new format
            const participantName = participantData.userName || 'Guest User';
            
            if (participantId !== userId && !peerConnectionsRef.current[participantId]) {
              console.log('Creating connection to existing participant:', participantId, participantName);
              createPeerConnection(participantId);
              
              // Store participant name
              setParticipantNames(prev => ({
                ...prev,
                [participantId]: participantName
              }));
            }
          });

          // Update participants list with existing participants
          const participantIds = existingParticipants.map(p => p.userId || p).filter(id => id && id !== userId);
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
          // Only add message if it's not from the current user to avoid duplicates
          if (message.userId !== userId) {
            // Check if message already exists to prevent duplicates
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

          // Handle both old format (just userId) and new format ({userId, userName})
          const joinedUserId = joinedUserData.userId || joinedUserData;
          const joinedUserName = joinedUserData.userName || 'Guest User';

          // Only create connection if it's not the current user and we don't already have a connection
          if (joinedUserId !== userId && !peerConnectionsRef.current[joinedUserId]) {
            // Store participant name
            setParticipantNames(prev => ({
              ...prev,
              [joinedUserId]: joinedUserName
            }));

            // Show notification
            notifyUserJoined(joinedUserName);

            // Create WebRTC connection for the new participant
            createPeerConnection(joinedUserId);

            setParticipants(prev => {
              // Strict deduplication using Set and String conversion
              const newSet = new Set(prev.map(String));

              if (joinedUserId && joinedUserId !== userId) {
                newSet.add(String(joinedUserId));
              }

              return Array.from(newSet);
            });
          } else {
            console.log('User already connected or is current user:', joinedUserId);
          }
        });

        // Handle WebRTC signaling
        socket.on('webrtc-signal', async (data) => {
          if (data.senderId !== userId) { // Don't process our own signals
            await handleWebRTCSignal(data);
          }
        });

        // Handle user left events
        socket.on('user-left', (leftUserData) => {
          console.log('User left:', leftUserData);

          // Handle both old format (just userId) and new format ({userId, userName})
          const leftUserId = leftUserData.userId || leftUserData;
          const leftUserName = leftUserData.userName || participantNames[leftUserId] || 'Guest User';

          // Show notification
          notifyUserLeft(leftUserName);

          // Remove the user from participants list
          setParticipants(prev => prev.filter(p => p !== leftUserId));

          // Remove participant name
          setParticipantNames(prev => {
            const newNames = { ...prev };
            delete newNames[leftUserId];
            return newNames;
          });

          // Clean up peer connection and video
          if (peerConnectionsRef.current[leftUserId]) {
            peerConnectionsRef.current[leftUserId].close();
            delete peerConnectionsRef.current[leftUserId];
          }

          if (remoteVideosRef.current[leftUserId]) {
            delete remoteVideosRef.current[leftUserId];
          }
        });

        // Check permissions before initializing WebRTC
        const permissionsOk = await checkAndRequestPermissions();
        if (permissionsOk && !joinWithoutMedia) {
          // Initialize WebRTC with better browser compatibility
          await initWebRTC();
        } else if (joinWithoutMedia) {
          console.log('Joining without media as requested by user');
        } else {
          console.warn('Permissions not granted, user can still join without media');
          setJoinWithoutMedia(true);
        }

        // Note: We deliberately removed the logic that created peer connections from data.meeting.participants
        // This prevents trying to connect to stale/disconnected users found in the database.
        // Connections are now exclusively managed by socket events ('existing-participants' and 'user-joined')

      } catch (error) {
        console.error('Error joining meeting:', error);
        showError('Failed to join meeting. Please check the meeting ID and try again.');
      }
    };

    initMeeting();

    return () => {
      // Cleanup
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
    };
  }, [meetingId]);

  const initWebRTC = async () => {
    try {
      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia is not supported in this browser');
      }

      // Enhanced browser compatibility for media constraints
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

      // Browser-specific fixes
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
      const isEdge = navigator.userAgent.indexOf('Edg') > -1;
      const isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;

      // Safari-specific constraints
      if (isSafari) {
        constraints.video = {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        };
        constraints.audio = {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        };
      }

      // Firefox-specific constraints
      if (isFirefox) {
        constraints.video = {
          facingMode: 'user',
          width: { min: 640, ideal: 1280 },
          height: { min: 480, ideal: 720 }
        };
        constraints.audio = {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          mozEchoCancellation: true,
          mozAutoGainControl: true,
          mozNoiseSuppression: true
        };
      }

      // Chrome/Edge specific optimizations
      if (isChrome || isEdge) {
        constraints.video.frameRate = { ideal: 30, max: 60 };
        constraints.audio = {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          googEchoCancellation: true,
          googAutoGainControl: true,
          googNoiseSuppression: true,
          googHighpassFilter: true,
          googTypingNoiseDetection: true,
          sampleRate: 48000,
          channelCount: 1
        };
      }

      // Get user media with better error handling
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (constraintError) {
        console.warn('Failed with preferred constraints, trying simpler constraints:', constraintError);

        // Try with simpler constraints
        const simpleConstraints = {
          video: true,
          audio: true
        };

        stream = await navigator.mediaDevices.getUserMedia(simpleConstraints);
      }

      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;

        // Handle video element errors
        localVideoRef.current.onerror = (e) => {
          console.error('Local video element error:', e);
          alert('There was an error with the video element. Please try refreshing the page.');
        };
      }

      // Initialize tracks based on current state
      const audioTrack = stream.getAudioTracks()[0];
      const videoTrack = stream.getVideoTracks()[0];

      console.log('Stream tracks:', {
        audioTracks: stream.getAudioTracks().length,
        videoTracks: stream.getVideoTracks().length,
        audioEnabled: audioTrack ? audioTrack.enabled : 'no audio track',
        videoEnabled: videoTrack ? videoTrack.enabled : 'no video track'
      });

      if (audioTrack) {
        // Ensure audio is enabled by default (not muted)
        audioTrack.enabled = !isMuted;
        
        // Set audio track properties for better quality
        if (audioTrack.getSettings) {
          const settings = audioTrack.getSettings();
          console.log('Audio track settings:', settings);
        }
        
        audioTrack.onended = () => {
          console.warn('Audio track ended unexpectedly');
          alert('Audio track was stopped. Please check your microphone and refresh the page.');
        };
        
        // Monitor audio levels (optional)
        audioTrack.onmute = () => {
          console.warn('Audio track was muted externally');
        };
        
        audioTrack.onunmute = () => {
          console.log('Audio track was unmuted externally');
        };
        
        console.log('Audio track initialized:', {
          enabled: audioTrack.enabled,
          muted: audioTrack.muted,
          readyState: audioTrack.readyState,
          kind: audioTrack.kind,
          label: audioTrack.label
        });
        
        // Set up audio level monitoring
        setupAudioLevelMonitoring(stream);
      } else {
        console.error('No audio track found in stream!');
        alert('No microphone detected. Please check your microphone connection and refresh the page.');
      }
      
      if (videoTrack) {
        videoTrack.enabled = isVideoOn;
        videoTrack.onended = () => {
          console.warn('Video track ended unexpectedly');
          alert('Video track was stopped. Please check your camera and refresh the page.');
        };
        
        console.log('Video track initialized:', {
          enabled: videoTrack.enabled,
          readyState: videoTrack.readyState,
          kind: videoTrack.kind,
          label: videoTrack.label
        });
      }

      // Handle permission changes
      if (navigator.permissions) {
        try {
          const videoPermission = await navigator.permissions.query({ name: 'camera' });
          const audioPermission = await navigator.permissions.query({ name: 'microphone' });

          videoPermission.onchange = () => {
            console.log('Camera permission changed to:', videoPermission.state);
            if (videoPermission.state === 'denied') {
              alert('Camera permission was denied. Please enable it in your browser settings and refresh the page.');
            } else if (videoPermission.state === 'granted') {
              console.log('Camera permission granted, reinitializing...');
              // Try to reinitialize if permission was granted
              initWebRTC().catch(console.error);
            }
          };

          audioPermission.onchange = () => {
            console.log('Microphone permission changed to:', audioPermission.state);
            if (audioPermission.state === 'denied') {
              alert('Microphone permission was denied. Please enable it in your browser settings and refresh the page.');
            } else if (audioPermission.state === 'granted') {
              console.log('Microphone permission granted, reinitializing...');
              // Try to reinitialize if permission was granted
              initWebRTC().catch(console.error);
            }
          };
        } catch (permissionError) {
          console.warn('Permission API not fully supported:', permissionError);
        }
      }

      // Browser-specific post-processing
      if (isSafari) {
        // Safari sometimes needs a small delay before tracks are ready
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      console.log('Successfully initialized WebRTC with stream:', stream);

    } catch (error) {
      console.error('Error accessing media devices:', error);

      // More specific error handling with browser-specific advice
      if (error.name === 'NotAllowedError') {
        const browserName = detectBrowser();
        let message = 'Camera/microphone access was denied. ';

        if (browserName.includes('Chrome') || browserName.includes('Edge')) {
          message += 'Click the camera icon in the address bar to enable permissions.';
        } else if (browserName.includes('Firefox')) {
          message += 'Click the padlock icon in the address bar to enable permissions.';
        } else if (browserName.includes('Safari')) {
          message += 'Go to Safari Preferences > Websites > Camera/Microphone to enable permissions.';
        } else {
          message += 'Please check your browser permissions.';
        }

        message += ' Then refresh the page.';
        alert(message);
      } else if (error.name === 'NotFoundError') {
        alert('No camera/microphone found. Please connect a device and refresh the page.');
      } else if (error.name === 'NotSupportedError') {
        const browserName = detectBrowser();
        alert(`Your browser (${browserName}) does not support camera/microphone access. Please try Chrome, Firefox, or Edge.`);
      } else if (error.name === 'OverconstrainedError') {
        alert('Your camera does not support the required settings. Trying with default settings...');
        // Fallback to simplest possible constraints
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
          });
          localStreamRef.current = fallbackStream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = fallbackStream;
          }
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
          alert('Could not access camera/microphone even with fallback settings.');
        }
      } else if (error.name === 'SecurityError') {
        alert('Camera/microphone access was blocked for security reasons. Please ensure you are using HTTPS and try again.');
      } else if (error.name === 'TypeError') {
        alert('There was a configuration error. Please try refreshing the page.');
      } else {
        alert('Could not access camera/microphone. Please check permissions and try again.');
      }
    }
  };

  // Function to enable media after joining without it
  const enableMedia = async () => {
    try {
      setJoinWithoutMedia(false);
      await initWebRTC();
      
      // Show success notification
      notifyMediaEnabled();
      
      // Update all existing peer connections with new media
      if (localStreamRef.current) {
        Object.values(peerConnectionsRef.current).forEach(async (pc) => {
          const senders = pc.getSenders();
          const tracks = localStreamRef.current.getTracks();
          
          for (const track of tracks) {
            const sender = senders.find(s => s.track && s.track.kind === track.kind);
            if (sender) {
              await sender.replaceTrack(track);
            } else {
              pc.addTrack(track, localStreamRef.current);
            }
          }
        });
      }
    } catch (error) {
      console.error('Error enabling media:', error);
      showError('Could not enable camera/microphone. Please check permissions and try again.');
    }
  };
  const detectBrowser = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Edg')) return 'Edge';
    if (userAgent.includes('Opera') || userAgent.includes('OPR')) return 'Opera';
    return 'Unknown browser';
  };

  // Setup audio level monitoring
  const setupAudioLevelMonitoring = (stream) => {
    try {
      if (window.AudioContext || window.webkitAudioContext) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        
        analyser.fftSize = 256;
        source.connect(analyser);
        
        audioContextRef.current = audioContext;
        audioAnalyserRef.current = analyser;
        
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        
        const updateAudioLevel = () => {
          if (audioAnalyserRef.current && !isMuted) {
            audioAnalyserRef.current.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
            setAudioLevel(average);
          } else {
            setAudioLevel(0);
          }
          
          requestAnimationFrame(updateAudioLevel);
        };
        
        updateAudioLevel();
        console.log('Audio level monitoring started');
      }
    } catch (error) {
      console.warn('Could not set up audio level monitoring:', error);
    }
  };

  const toggleMute = async () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        const newMutedState = !isMuted;
        audioTrack.enabled = !newMutedState;
        setIsMuted(newMutedState);
        
        console.log(`Audio ${newMutedState ? 'muted' : 'unmuted'}:`, {
          enabled: audioTrack.enabled,
          readyState: audioTrack.readyState,
          muted: audioTrack.muted
        });
        
        // Update all peer connections with the new audio state
        Object.values(peerConnectionsRef.current).forEach(pc => {
          if (pc.senders) {
            pc.senders.forEach(sender => {
              if (sender.track && sender.track.kind === 'audio') {
                sender.track.enabled = !newMutedState;
              }
            });
          }
        });
      } else {
        console.error('No audio track found to toggle mute');
        // Try to reinitialize audio if no track exists
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const newAudioTrack = audioStream.getAudioTracks()[0];
          
          if (newAudioTrack) {
            // Replace audio track in local stream
            if (localStreamRef.current.getAudioTracks().length > 0) {
              localStreamRef.current.removeTrack(localStreamRef.current.getAudioTracks()[0]);
            }
            localStreamRef.current.addTrack(newAudioTrack);
            
            // Update peer connections
            Object.values(peerConnectionsRef.current).forEach(async (pc) => {
              const audioSender = pc.getSenders().find(sender => 
                sender.track && sender.track.kind === 'audio'
              );
              
              if (audioSender) {
                await audioSender.replaceTrack(newAudioTrack);
              } else {
                pc.addTrack(newAudioTrack, localStreamRef.current);
              }
            });
            
            newAudioTrack.enabled = !isMuted;
            console.log('Audio track reinitialized successfully');
          }
        } catch (error) {
          console.error('Failed to reinitialize audio:', error);
          alert('Could not access microphone. Please check permissions and refresh the page.');
        }
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoOn;
        setIsVideoOn(!isVideoOn);
      }
    }
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      const stream = localStreamRef.current;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      // Switch back to camera
      try {
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        localStreamRef.current = cameraStream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = cameraStream;
        }

        // Restore mute/video states
        const audioTrack = cameraStream.getAudioTracks()[0];
        const videoTrack = cameraStream.getVideoTracks()[0];

        if (audioTrack) {
          audioTrack.enabled = !isMuted;
        }
        if (videoTrack) {
          videoTrack.enabled = isVideoOn;
        }

        setIsScreenSharing(false);
      } catch (error) {
        console.error('Error switching back to camera:', error);
        alert('Could not switch back to camera.');
      }
    } else {
      // Start screen sharing
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });

        // Store the original camera stream for later restoration
        const originalStream = localStreamRef.current;

        // Use screen stream directly
        localStreamRef.current = screenStream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        setIsScreenSharing(true);

        screenStream.getVideoTracks()[0].onended = async () => {
          await toggleScreenShare(); // Auto-switch back when user stops sharing
        };
      } catch (error) {
        console.error('Error sharing screen:', error);
        alert('Could not share screen. Please check permissions.');
      }
    }
  };

  const sendMessage = () => {
    if (newMessage.trim() && userId) {
      const message = {
        id: Date.now().toString(),
        userId,
        userName: userName,
        text: newMessage,
        timestamp: new Date().toISOString(),
        meetingId
      };

      // Send message via WebSocket to other participants
      if (socketRef.current) {
        socketRef.current.emit('chat-message', message);
      }

      // Add message to local state only if it's from current user
      setMessages(prevMessages => [...prevMessages, message]);
      setNewMessage('');
    }
  };

  // Function to check and request permissions
  const checkAndRequestPermissions = async () => {
    try {
      if (navigator.permissions) {
        const cameraPermission = await navigator.permissions.query({ name: 'camera' });
        const microphonePermission = await navigator.permissions.query({ name: 'microphone' });

        console.log('Current permissions - Camera:', cameraPermission.state, 'Microphone:', microphonePermission.state);

        if (cameraPermission.state === 'prompt' || microphonePermission.state === 'prompt') {
          // Permissions not yet granted, show helpful message
          const browserName = detectBrowser();
          let message = `This application needs camera and microphone access. `;

          if (browserName.includes('Chrome') || browserName.includes('Edge')) {
            message += 'Look for the permission prompt at the top of your browser.';
          } else if (browserName.includes('Firefox')) {
            message += 'A permission dialog should appear shortly.';
          } else if (browserName.includes('Safari')) {
            message += 'Safari will ask for permission when we try to access the camera.';
          }

          alert(message);
        } else if (cameraPermission.state === 'denied' || microphonePermission.state === 'denied') {
          // Permissions were denied, show how to enable them
          const browserName = detectBrowser();
          let message = 'Camera/microphone permissions were previously denied. ';

          if (browserName.includes('Chrome') || browserName.includes('Edge')) {
            message += 'Click the padlock icon in the address bar to enable permissions.';
          } else if (browserName.includes('Firefox')) {
            message += 'Click the padlock icon in the address bar to enable permissions.';
          } else if (browserName.includes('Safari')) {
            message += 'Go to Safari Preferences > Websites > Camera/Microphone to enable permissions.';
          } else {
            message += 'Please check your browser settings.';
          }

          message += ' Then refresh this page.';
          alert(message);
          return false;
        }
      }
      return true;
    } catch (error) {
      console.warn('Permission check failed, proceeding anyway:', error);
      return true;
    }
  };

  const leaveMeeting = async () => {
    confirmLeaveMeeting(async () => {
      try {
        // Call API to leave meeting
        await leaveMeeting(meetingId, userId);

        // Cleanup
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach(track => track.stop());
        }

        // Close all peer connections
        Object.values(peerConnectionsRef.current).forEach(pc => pc.close());

        // Show success notification
        notifyMeetingLeft();

        // Redirect to home after a short delay
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
  };

  // WebRTC helper functions
  const createPeerConnection = async (remoteUserId) => {
    try {
      if (!localStreamRef.current) {
        console.warn('No local stream available for peer connection');
        return;
      }

      // Check if we already have a connection to this user
      if (peerConnectionsRef.current[remoteUserId]) {
        console.log('Peer connection already exists for', remoteUserId);
        return;
      }

      // Browser-specific RTCPeerConnection configuration
      const configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' },
          { urls: 'stun:stun4.l.google.com:19302' }
        ],
        iceCandidatePoolSize: 10,
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require'
      };

      // Detect browser and apply specific settings
      const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      const isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
      const isEdge = navigator.userAgent.indexOf('Edg') > -1;

      if (isFirefox) {
        configuration.bundlePolicy = 'max-bundle';
        configuration.rtcpMuxPolicy = 'require';
        // Firefox specific ICE servers
        configuration.iceServers.push(
          { urls: 'stun:stun.mozilla.org' }
        );
      }

      if (isSafari) {
        configuration.iceTransportPolicy = 'all';
        configuration.bundlePolicy = 'balanced';
        // Safari works better with fewer ICE servers
        configuration.iceServers = [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ];
      }

      if (isChrome || isEdge) {
        // Chrome/Edge optimizations
        configuration.sdpSemantics = 'unified-plan';
        configuration.bundlePolicy = 'max-bundle';
      }

      const pc = new RTCPeerConnection(configuration);

      // Store the peer connection
      peerConnectionsRef.current[remoteUserId] = pc;

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        console.log(`Connection state change for ${remoteUserId}: ${pc.connectionState}`);
        if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
          cleanupPeerConnection(remoteUserId);
        }
      };

      // Handle ICE connection state changes
      pc.oniceconnectionstatechange = () => {
        console.log(`ICE connection state change for ${remoteUserId}: ${pc.iceConnectionState}`);

        // Handle ICE connection failures
        if (pc.iceConnectionState === 'failed') {
          console.warn('ICE connection failed, attempting to restart...');
          restartIceConnection(pc, remoteUserId);
        }
      };

      // Handle signaling state changes
      pc.onsignalingstatechange = () => {
        console.log(`Signaling state change for ${remoteUserId}: ${pc.signalingState}`);
      };

      // Add local stream to connection with proper track handling
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          try {
            console.log(`Adding ${track.kind} track to peer connection for ${remoteUserId}`);
            const sender = pc.addTrack(track, localStreamRef.current);
            
            // Store sender reference for later track replacement
            if (!pc.senders) {
              pc.senders = [];
            }
            pc.senders.push(sender);
            
            console.log(`Successfully added ${track.kind} track`);
          } catch (error) {
            console.error('Error adding track:', error);
          }
        });
      } else {
        console.warn('No local stream available when creating peer connection');
      }

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('Sending ICE candidate to', remoteUserId);

          // Browser-specific candidate handling
          let candidate = event.candidate;
          if (isFirefox && candidate.candidate) {
            // Firefox sometimes needs candidate sdpMid/sdpMLineIndex fixed
            candidate = {
              candidate: candidate.candidate,
              sdpMid: candidate.sdpMid || '0',
              sdpMLineIndex: candidate.sdpMLineIndex !== undefined ? candidate.sdpMLineIndex : 0
            };
          }

          socketRef.current.emit('webrtc-signal', {
            meetingId,
            senderId: userId,
            receiverId: remoteUserId,
            type: 'candidate',
            candidate: candidate
          });
        }
      };

      // Handle remote stream
      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          console.log('Received remote stream from', remoteUserId);

          const stream = event.streams[0];
          
          // Store the remote stream in ref for backup
          remoteVideosRef.current[remoteUserId] = {
            stream: stream,
            userId: remoteUserId
          };

          // Update state to trigger re-render and clear "Waiting for video..."
          setRemoteStreams(prev => ({
            ...prev,
            [remoteUserId]: stream
          }));

          // Force re-render of participants if needed
          setParticipants(prev => {
            if (!prev.includes(remoteUserId)) {
              return [...prev, remoteUserId];
            }
            return [...prev]; // Create new reference to force update
          });

          // Ensure video element gets the stream
          setTimeout(() => {
            const videoElement = document.getElementById(`remote-video-${remoteUserId}`);
            if (videoElement && videoElement.srcObject !== stream) {
              videoElement.srcObject = stream;
              videoElement.play().catch(e => {
                console.error('Autoplay failed for remote video:', e);
                // Try with muted first
                videoElement.muted = true;
                videoElement.play().then(() => {
                  // Unmute after successful play
                  setTimeout(() => {
                    videoElement.muted = false;
                  }, 1000);
                }).catch(console.error);
              });
            }
          }, 100);
        }
      };

      // Handle data channels (for future use)
      pc.ondatachannel = (event) => {
        console.log('Data channel received from', remoteUserId);
      };

      // Handle negotiation needed events
      pc.onnegotiationneeded = async () => {
        console.log('Negotiation needed for', remoteUserId);
        try {
          const offer = await pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
          });
          await pc.setLocalDescription(offer);

          console.log('Sending offer to', remoteUserId);
          socketRef.current.emit('webrtc-signal', {
            meetingId,
            senderId: userId,
            receiverId: remoteUserId,
            type: 'offer',
            sdp: offer.sdp
          });
        } catch (error) {
          console.error('Error creating offer in negotiation:', error);
        }
      };

      // Create and send offer
      try {
        // Browser-specific offer options
        const offerOptions = {
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        };

        // Firefox specific options
        if (isFirefox) {
          offerOptions.voiceActivityDetection = false;
        }

        // Safari specific options
        if (isSafari) {
          offerOptions.iceRestart = false;
        }

        const offer = await pc.createOffer(offerOptions);

        // Browser-specific SDP processing
        let sdp = offer.sdp;
        if (isFirefox) {
          // Firefox may need SDP processing
          sdp = processSdpForFirefox(sdp);
        } else if (isSafari) {
          // Safari SDP processing
          sdp = processSdpForSafari(sdp);
        } else if (isChrome || isEdge) {
          // Chrome/Edge SDP processing
          sdp = processSdpForChrome(sdp);
        }

        await pc.setLocalDescription({ type: 'offer', sdp });

        console.log('Sending offer to', remoteUserId);
        socketRef.current.emit('webrtc-signal', {
          meetingId,
          senderId: userId,
          receiverId: remoteUserId,
          type: 'offer',
          sdp: sdp
        });
      } catch (error) {
        console.error('Error creating offer:', error);
      }

    } catch (error) {
      console.error('Error creating peer connection:', error);
    }
  };

  // Helper function to restart ICE connection
  const restartIceConnection = async (pc, remoteUserId) => {
    try {
      console.log('Restarting ICE connection for', remoteUserId);

      // Create a new ICE restart offer
      const offer = await pc.createOffer({
        iceRestart: true,
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });

      await pc.setLocalDescription(offer);

      socketRef.current.emit('webrtc-signal', {
        meetingId,
        senderId: userId,
        receiverId: remoteUserId,
        type: 'offer',
        sdp: offer.sdp
      });
    } catch (error) {
      console.error('Error restarting ICE connection:', error);
    }
  };

  // Helper function to process SDP for Firefox
  const processSdpForFirefox = (sdp) => {
    // Firefox sometimes needs SDP lines reordered or modified
    let lines = sdp.split('\r\n');
    let newLines = [];

    // Move a=setup lines to be after m= lines
    let setupLines = [];

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('a=setup:')) {
        setupLines.push(lines[i]);
      } else {
        newLines.push(lines[i]);
        // If this is an m= line, add any pending setup lines
        if (lines[i].startsWith('m=') && setupLines.length > 0) {
          newLines = newLines.concat(setupLines);
          setupLines = [];
        }
      }
    }

    // Add any remaining setup lines
    if (setupLines.length > 0) {
      newLines = newLines.concat(setupLines);
    }

    return newLines.join('\r\n');
  };

  // Helper function to process SDP for Safari
  const processSdpForSafari = (sdp) => {
    // Safari specific SDP processing
    let lines = sdp.split('\r\n');
    let processedLines = [];

    for (let line of lines) {
      // Safari sometimes has issues with certain codec parameters
      if (line.includes('a=fmtp:') && line.includes('profile-level-id')) {
        // Ensure profile-level-id is compatible
        line = line.replace(/profile-level-id=[^;]+/, 'profile-level-id=42e01f');
      }
      
      // Safari prefers certain RTP extensions
      if (line.includes('a=extmap:') && line.includes('urn:ietf:params:rtp-hdrext:ssrc-audio-level')) {
        // Keep audio level extension for Safari
        processedLines.push(line);
        continue;
      }

      processedLines.push(line);
    }

    return processedLines.join('\r\n');
  };

  // Helper function to process SDP for Chrome/Edge
  const processSdpForChrome = (sdp) => {
    // Chrome/Edge specific SDP processing
    let lines = sdp.split('\r\n');
    let processedLines = [];

    for (let line of lines) {
      // Chrome/Edge optimizations
      if (line.includes('a=fmtp:') && line.includes('x-google-flag')) {
        // Keep Google-specific parameters
        processedLines.push(line);
        continue;
      }

      // Ensure proper codec ordering for Chrome
      if (line.startsWith('m=video')) {
        // Prefer VP8/VP9 for better compatibility
        line = line.replace(/(\d+)\s+(\d+)\s+(\d+)/, (match, p1, p2, p3) => {
          return `${p1} ${p2} ${p3}`;
        });
      }

      processedLines.push(line);
    }

    return processedLines.join('\r\n');
  };

  const cleanupPeerConnection = (remoteUserId) => {
    console.log('Cleaning up peer connection for', remoteUserId);

    if (peerConnectionsRef.current[remoteUserId]) {
      try {
        peerConnectionsRef.current[remoteUserId].close();
      } catch (error) {
        console.error('Error closing peer connection:', error);
      }
      delete peerConnectionsRef.current[remoteUserId];
    }

    if (remoteVideosRef.current[remoteUserId]) {
      delete remoteVideosRef.current[remoteUserId];
    }

    // Remove from remote streams
    setRemoteStreams(prev => {
      const newStreams = { ...prev };
      delete newStreams[remoteUserId];
      return newStreams;
    });
  };

  const handleWebRTCSignal = async (data) => {
    const { senderId, type, sdp, candidate } = data;

    console.log(`Received WebRTC signal from ${senderId}: ${type}`);

    // Ensure we have a peer connection for this sender
    if (!peerConnectionsRef.current[senderId]) {
      console.log('Creating new peer connection for', senderId);
      await createPeerConnection(senderId);
      // Wait a bit for the connection to be established
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const pc = peerConnectionsRef.current[senderId];
    if (!pc) {
      console.warn('No peer connection found for sender:', senderId);
      return;
    }

    try {
      // Browser detection for SDP processing
      const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      const isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
      const isEdge = navigator.userAgent.indexOf('Edg') > -1;

      if (type === 'offer') {
        console.log('Handling offer from', senderId);

        // Browser-specific SDP processing before setting remote description
        let processedSdp = sdp;
        
        if (isFirefox) {
          processedSdp = processSdpForFirefox(processedSdp);
        } else if (isSafari) {
          processedSdp = processSdpForSafari(processedSdp);
        } else if (isChrome || isEdge) {
          processedSdp = processSdpForChrome(processedSdp);
        }

        await pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: processedSdp }));

        // Browser-specific answer options
        const answerOptions = {
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        };

        if (isFirefox) {
          answerOptions.voiceActivityDetection = false;
        }

        const answer = await pc.createAnswer(answerOptions);

        // Process the answer SDP as well
        let answerSdp = answer.sdp;
        if (isFirefox) {
          answerSdp = processSdpForFirefox(answerSdp);
        } else if (isSafari) {
          answerSdp = processSdpForSafari(answerSdp);
        } else if (isChrome || isEdge) {
          answerSdp = processSdpForChrome(answerSdp);
        }

        await pc.setLocalDescription({ type: 'answer', sdp: answerSdp });

        console.log('Sending answer to', senderId);
        socketRef.current.emit('webrtc-signal', {
          meetingId,
          senderId: userId,
          receiverId: senderId,
          type: 'answer',
          sdp: answerSdp
        });
      } else if (type === 'answer') {
        console.log('Handling answer from', senderId);

        // Process answer SDP if needed
        let processedSdp = sdp;
        
        if (isFirefox) {
          processedSdp = processSdpForFirefox(processedSdp);
        } else if (isSafari) {
          processedSdp = processSdpForSafari(processedSdp);
        } else if (isChrome || isEdge) {
          processedSdp = processSdpForChrome(processedSdp);
        }

        await pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: processedSdp }));
      } else if (type === 'candidate') {
        console.log('Handling ICE candidate from', senderId);

        try {
          // Handle browser-specific candidate formats
          let iceCandidate;
          if (candidate && typeof candidate === 'object') {
            // Ensure candidate has required fields for all browsers
            const candidateObj = {
              candidate: candidate.candidate,
              sdpMid: candidate.sdpMid || '0',
              sdpMLineIndex: candidate.sdpMLineIndex !== undefined ? candidate.sdpMLineIndex : 0
            };
            
            iceCandidate = new RTCIceCandidate(candidateObj);
          } else if (candidate && typeof candidate === 'string') {
            // Some browsers might send candidate as string
            try {
              const candidateObj = JSON.parse(candidate);
              iceCandidate = new RTCIceCandidate(candidateObj);
            } catch (parseError) {
              console.error('Error parsing candidate string:', parseError);
              return;
            }
          } else {
            console.warn('Invalid candidate format:', candidate);
            return;
          }

          // Wait for remote description to be set before adding candidates
          if (pc.remoteDescription) {
            await pc.addIceCandidate(iceCandidate);
          } else {
            // Queue the candidate for later
            console.log('Queueing ICE candidate until remote description is set');
            setTimeout(async () => {
              if (pc.remoteDescription) {
                try {
                  await pc.addIceCandidate(iceCandidate);
                } catch (error) {
                  console.warn('Error adding queued ICE candidate:', error);
                }
              }
            }, 1000);
          }
        } catch (error) {
          if (error.name !== 'InvalidStateError') {
            console.error('Error adding ICE candidate:', error);
          }
          // Ignore InvalidStateError as it's common when connection is already established
        }
      }
    } catch (error) {
      console.error('Error handling WebRTC signal:', error);
      
      // Try to recover from certain errors
      if (error.name === 'InvalidStateError' && type === 'offer') {
        console.log('Attempting to recover from InvalidStateError...');
        try {
          // Reset the peer connection
          cleanupPeerConnection(senderId);
          await createPeerConnection(senderId);
          // Retry handling the signal
          setTimeout(() => handleWebRTCSignal(data), 1000);
        } catch (recoveryError) {
          console.error('Recovery failed:', recoveryError);
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="bg-white shadow-sm p-4 flex justify-between items-center border-b">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <FaVideo className="text-white text-sm" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-800">Meeting: {meetingId}</h1>
              <p className="text-sm text-gray-500 flex items-center">
                <FaClock className="mr-1" />
                Ongoing • {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <FaUsers className="text-gray-700 text-sm" />
              <span className="text-sm text-gray-700">{participants.length} participants</span>
            </div>
            
            <button
              onClick={leaveMeeting}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors"
            >
              Leave
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Video Area */}
          <div className="flex-1 p-4 overflow-auto bg-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 h-full">
              {/* Local Video */}
              <div className="bg-gray-800 rounded-xl overflow-hidden relative shadow-lg">
                {localStreamRef.current && !joinWithoutMedia ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-white text-center p-6 h-full flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-gray-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <FaUser className="text-3xl" />
                    </div>
                    <div className="text-sm font-medium mb-2">{userName}</div>
                    {joinWithoutMedia ? (
                      <div className="text-xs text-gray-300 mb-3">Joined without camera</div>
                    ) : (
                      <div className="text-xs text-gray-300 mb-3">Camera not available</div>
                    )}
                    {joinWithoutMedia && (
                      <button
                        onClick={enableMedia}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                      >
                        Enable Camera & Mic
                      </button>
                    )}
                  </div>
                )}
                <div className="absolute bottom-3 left-3 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2">
                  <span className="font-medium">{userName}</span>
                  <div className="flex items-center space-x-1">
                    {isMuted || joinWithoutMedia ? <FaMicrophoneSlash className="text-red-400" /> : <FaMicrophone className="text-green-400" />}
                    {!isMuted && !joinWithoutMedia && (
                      <div className="w-2 h-2 rounded-full bg-green-400" 
                           style={{ 
                             opacity: Math.min(audioLevel / 50, 1),
                             animation: audioLevel > 10 ? 'pulse 0.5s infinite' : 'none'
                           }}>
                      </div>
                    )}
                  </div>
                  {isVideoOn && !joinWithoutMedia ? <FaVideo className="text-green-400" /> : <FaVideoSlash className="text-red-400" />}
                </div>
              </div>

              {/* Remote Videos */}
              {participants.filter(p => p !== userId).map((participant, index) => {
                const stream = remoteStreams[participant];
                const videoId = `remote-video-${participant}`;

                return (
                  <div key={`${participant}-${index}`} className="bg-gray-800 rounded-xl overflow-hidden relative shadow-lg">
                    {stream ? (
                      <video
                        id={videoId}
                        autoPlay
                        playsInline
                        muted={false}
                        ref={el => {
                          if (el && stream) {
                            // Only set if different to avoid reloading
                            if (el.srcObject !== stream) {
                              console.log(`Setting stream for participant ${participant}`);
                              el.srcObject = stream;
                              
                              // Handle different browser autoplay policies
                              const playVideo = async () => {
                                try {
                                  await el.play();
                                  console.log(`Video playing for participant ${participant}`);
                                } catch (playError) {
                                  console.warn('Autoplay failed, trying with muted:', playError);
                                  // Try muted first
                                  el.muted = true;
                                  try {
                                    await el.play();
                                    // Unmute after successful play
                                    setTimeout(() => {
                                      el.muted = false;
                                    }, 1000);
                                  } catch (mutedError) {
                                    console.error('Even muted autoplay failed:', mutedError);
                                  }
                                }
                              };
                              
                              playVideo();
                            }
                          }
                        }}
                        onLoadedMetadata={() => {
                          console.log(`Video metadata loaded for participant ${participant}`);
                        }}
                        onCanPlay={() => {
                          console.log(`Video can play for participant ${participant}`);
                        }}
                        onError={(e) => {
                          console.error(`Video error for participant ${participant}:`, e);
                        }}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-white text-center p-6 h-full flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-gray-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                          <FaUsers className="text-3xl" />
                        </div>
                        <div className="text-sm font-medium">
                          {participantNames[participant] || `Participant ${participant.substring(0, 6)}...`}
                        </div>
                        <div className="text-xs mt-2 text-gray-300">Waiting for video...</div>
                        <div className="text-xs mt-1 text-gray-400">
                          {peerConnectionsRef.current[participant] ? 
                            `Connection: ${peerConnectionsRef.current[participant].connectionState}` : 
                            'Connecting...'
                          }
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm">
                      <span className="font-medium">
                        {participantNames[participant] || `Participant ${participant.substring(0, 6)}...`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chat Panel */}
          <div className="w-80 bg-white border-l overflow-hidden flex flex-col shadow-lg">
            <div className="bg-gray-50 p-4 border-b">
              <h3 className="font-semibold text-gray-800">Meeting Chat</h3>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  <div className="text-2xl mb-2"><FaComment /></div>
                  <p className="text-sm">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.userId === userId ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs rounded-lg p-3 ${message.userId === userId ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'} shadow-sm`}
                    >
                      <div className="text-xs font-medium mb-1">
                        {message.userId === userId ? 
                          userName : 
                          (message.userName || participantNames[message.userId] || `Participant ${message.userId.substring(0, 6)}...`)
                        }
                      </div>
                      <div className="text-sm">{message.text}</div>
                      <div className="text-xs mt-2 opacity-70">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t bg-gray-50">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Send a message..."
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={sendMessage}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white p-4 border-t flex justify-center items-center space-x-4 shadow-lg">
          <button
            onClick={toggleMute}
            disabled={joinWithoutMedia}
            className={`p-3 rounded-full flex items-center justify-center transition-colors ${
              isMuted || joinWithoutMedia ? 'bg-red-100 text-red-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            } ${joinWithoutMedia ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={joinWithoutMedia ? 'Enable media first' : (isMuted ? 'Unmute' : 'Mute')}
          >
            {isMuted || joinWithoutMedia ? (
              <FaMicrophoneSlash className="text-xl" />
            ) : (
              <FaMicrophone className="text-xl" />
            )}
          </button>

          <button
            onClick={toggleVideo}
            disabled={joinWithoutMedia}
            className={`p-3 rounded-full flex items-center justify-center transition-colors ${
              !isVideoOn || joinWithoutMedia ? 'bg-red-100 text-red-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            } ${joinWithoutMedia ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={joinWithoutMedia ? 'Enable media first' : (isVideoOn ? 'Turn off video' : 'Turn on video')}
          >
            {isVideoOn && !joinWithoutMedia ? (
              <FaVideo className="text-xl" />
            ) : (
              <FaVideoSlash className="text-xl" />
            )}
          </button>

          <button
            onClick={toggleScreenShare}
            className={`p-3 rounded-full flex items-center justify-center transition-colors ${isScreenSharing ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
            title={isScreenSharing ? 'Stop sharing screen' : 'Share screen'}
          >
            <FaDesktop className="text-xl" />
          </button>

          <button
            onClick={leaveMeeting}
            className="p-3 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
            title="Leave meeting"
          >
            <FaPhone className="text-xl" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeetingRoom;