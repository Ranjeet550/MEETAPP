import { useCallback } from 'react';

export const useWebRTC = (state, meetingId) => {
  const {
    userId,
    localStreamRef,
    peerConnectionsRef,
    socketRef,
    audioContextRef,
    audioAnalyserRef,
    setRemoteStreams,
    setParticipants,
    setAudioLevel,
    isMuted,
    isVideoOn
  } = state;

  // Create peer connection
  const createPeerConnection = useCallback(async (remoteUserId) => {
    try {
      if (!localStreamRef.current) {
        console.warn('No local stream available for peer connection');
        return;
      }

      if (peerConnectionsRef.current[remoteUserId]) {
        console.log('Peer connection already exists for', remoteUserId);
        return;
      }

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

      const pc = new RTCPeerConnection(configuration);
      peerConnectionsRef.current[remoteUserId] = pc;

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        console.log(`Connection state change for ${remoteUserId}: ${pc.connectionState}`);
        if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
          cleanupPeerConnection(remoteUserId);
        }
      };

      // Add local stream to connection
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          try {
            console.log(`Adding ${track.kind} track to peer connection for ${remoteUserId}`);
            pc.addTrack(track, localStreamRef.current);
          } catch (error) {
            console.error('Error adding track:', error);
          }
        });
      }

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('Sending ICE candidate to', remoteUserId);
          socketRef.current.emit('webrtc-signal', {
            meetingId,
            senderId: userId,
            receiverId: remoteUserId,
            type: 'candidate',
            candidate: event.candidate
          });
        }
      };

      // Handle remote stream
      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          console.log('Received remote stream from', remoteUserId);
          const stream = event.streams[0];
          
          setRemoteStreams(prev => ({
            ...prev,
            [remoteUserId]: stream
          }));

          setParticipants(prev => {
            if (!prev.includes(remoteUserId)) {
              return [...prev, remoteUserId];
            }
            return [...prev];
          });
        }
      };

      // Create and send offer
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
        console.error('Error creating offer:', error);
      }

    } catch (error) {
      console.error('Error creating peer connection:', error);
    }
  }, [userId, meetingId, localStreamRef, peerConnectionsRef, socketRef, setRemoteStreams, setParticipants]);

  // Handle WebRTC signals
  const handleWebRTCSignal = useCallback(async (data) => {
    const { senderId, type, sdp, candidate } = data;

    console.log(`Received WebRTC signal from ${senderId}: ${type}`);

    if (!peerConnectionsRef.current[senderId]) {
      console.log('Creating new peer connection for', senderId);
      await createPeerConnection(senderId);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const pc = peerConnectionsRef.current[senderId];
    if (!pc) {
      console.warn('No peer connection found for sender:', senderId);
      return;
    }

    try {
      if (type === 'offer') {
        console.log('Handling offer from', senderId);
        await pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp }));

        const answer = await pc.createAnswer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        });

        await pc.setLocalDescription(answer);

        console.log('Sending answer to', senderId);
        socketRef.current.emit('webrtc-signal', {
          meetingId,
          senderId: userId,
          receiverId: senderId,
          type: 'answer',
          sdp: answer.sdp
        });
      } else if (type === 'answer') {
        console.log('Handling answer from', senderId);
        await pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp }));
      } else if (type === 'candidate') {
        console.log('Handling ICE candidate from', senderId);
        try {
          const iceCandidate = new RTCIceCandidate(candidate);
          if (pc.remoteDescription) {
            await pc.addIceCandidate(iceCandidate);
          } else {
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
        }
      }
    } catch (error) {
      console.error('Error handling WebRTC signal:', error);
    }
  }, [userId, meetingId, createPeerConnection, peerConnectionsRef, socketRef]);

  // Cleanup peer connection
  const cleanupPeerConnection = useCallback((remoteUserId) => {
    console.log('Cleaning up peer connection for', remoteUserId);

    if (peerConnectionsRef.current[remoteUserId]) {
      try {
        peerConnectionsRef.current[remoteUserId].close();
      } catch (error) {
        console.error('Error closing peer connection:', error);
      }
      delete peerConnectionsRef.current[remoteUserId];
    }

    setRemoteStreams(prev => {
      const newStreams = { ...prev };
      delete newStreams[remoteUserId];
      return newStreams;
    });
  }, [peerConnectionsRef, setRemoteStreams]);

  // Setup audio level monitoring
  const setupAudioLevelMonitoring = useCallback((stream) => {
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
  }, [audioContextRef, audioAnalyserRef, setAudioLevel, isMuted]);

  return {
    createPeerConnection,
    handleWebRTCSignal,
    cleanupPeerConnection,
    setupAudioLevelMonitoring
  };
};