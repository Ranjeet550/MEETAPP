import { useCallback } from 'react';

export const useMediaControls = (state) => {
  const {
    localStreamRef,
    peerConnectionsRef,
    isMuted,
    setIsMuted,
    isVideoOn,
    setIsVideoOn,
    isScreenSharing,
    setIsScreenSharing,
    localVideoRef,
    mediaRecorderRef,
    recordingIntervalRef,
    setIsRecording,
    setIsPaused,
    setRecordingDuration,
    currentDevices,
    setCurrentDevices
  } = state;

  // Toggle mute
  const toggleMute = useCallback(async () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        const newMutedState = !isMuted;
        audioTrack.enabled = !newMutedState;
        setIsMuted(newMutedState);
        
        console.log(`Audio ${newMutedState ? 'muted' : 'unmuted'}`);
        
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
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const newAudioTrack = audioStream.getAudioTracks()[0];
          
          if (newAudioTrack) {
            if (localStreamRef.current.getAudioTracks().length > 0) {
              localStreamRef.current.removeTrack(localStreamRef.current.getAudioTracks()[0]);
            }
            localStreamRef.current.addTrack(newAudioTrack);
            
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
          console.error('Failed to reinitialize audio track:', error);
          alert('Could not access microphone. Please check permissions and refresh the page.');
        }
      }
    }
  }, [isMuted, setIsMuted, localStreamRef, peerConnectionsRef]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoOn;
        setIsVideoOn(!isVideoOn);
      }
    }
  }, [isVideoOn, setIsVideoOn, localStreamRef]);

  // Toggle screen share
  const toggleScreenShare = useCallback(async () => {
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
  }, [isScreenSharing, setIsScreenSharing, localStreamRef, localVideoRef, isMuted, isVideoOn]);

  // Handle camera change
  const handleCameraChange = useCallback(async (deviceId) => {
    setCurrentDevices(prev => ({ ...prev, camera: deviceId }));
    
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.stop();
        try {
          const newStream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: deviceId } },
            audio: true
          });
          const newVideoTrack = newStream.getVideoTracks()[0];
          localStreamRef.current.removeTrack(videoTrack);
          localStreamRef.current.addTrack(newVideoTrack);
          
          // Update peer connections
          Object.values(peerConnectionsRef.current).forEach(async (pc) => {
            const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
            if (sender) {
              await sender.replaceTrack(newVideoTrack);
            }
          });
        } catch (error) {
          console.error('Error changing camera:', error);
        }
      }
    }
  }, [setCurrentDevices, localStreamRef, peerConnectionsRef]);

  // Handle microphone change
  const handleMicrophoneChange = useCallback(async (deviceId) => {
    setCurrentDevices(prev => ({ ...prev, microphone: deviceId }));
    // Similar implementation for microphone
  }, [setCurrentDevices]);

  // Recording controls
  const startRecording = useCallback(() => {
    if (!localStreamRef.current) return;
    
    try {
      const mediaRecorder = new MediaRecorder(localStreamRef.current);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          const blob = new Blob([event.data], { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `meeting-recording-${Date.now()}.webm`;
          a.click();
        }
      };
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }, [localStreamRef, mediaRecorderRef, recordingIntervalRef, setIsRecording, setRecordingDuration]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      clearInterval(recordingIntervalRef.current);
    }
  }, [mediaRecorderRef, setIsRecording, setIsPaused, recordingIntervalRef]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      clearInterval(recordingIntervalRef.current);
    }
  }, [mediaRecorderRef, setIsPaused, recordingIntervalRef]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    }
  }, [mediaRecorderRef, setIsPaused, recordingIntervalRef, setRecordingDuration]);

  return {
    toggleMute,
    toggleVideo,
    toggleScreenShare,
    handleCameraChange,
    handleMicrophoneChange,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording
  };
};