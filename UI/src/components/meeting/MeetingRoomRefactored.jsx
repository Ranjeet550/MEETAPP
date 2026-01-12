import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

// Import components
import MeetingLayout from './components/MeetingLayout';

// Import hooks
import { useMeetingState } from './hooks/useMeetingState';
import { useWebRTC } from './hooks/useWebRTC';
import { useMediaControls } from './hooks/useMediaControls';
import { useMeetingLogic } from './hooks/useMeetingLogic';

const MeetingRoom = () => {
  const { meetingId } = useParams();
  
  // Get all state from custom hook
  const {
    // User and meeting state
    userId, setUserId, userName, setUserName, participants, setParticipants,
    participantNames, setParticipantNames, messages, setMessages, newMessage, setNewMessage,
    
    // Media state
    isMuted, setIsMuted, isVideoOn, setIsVideoOn, isScreenSharing, setIsScreenSharing,
    audioLevel, setAudioLevel, joinWithoutMedia, setJoinWithoutMedia, streamReady, setStreamReady,

    // Feature states
    isHost, setIsHost, availableDevices, setAvailableDevices, currentDevices, setCurrentDevices,
    isRecording, setIsRecording, isPaused, setIsPaused, recordingDuration, setRecordingDuration,
    currentBackground, setCurrentBackground, breakoutRooms, setBreakoutRooms, 
    currentRoom, setCurrentRoom, reactions, setReactions,
    
    // UI state
    showChat, setShowChat, showRecording, setShowRecording, showBackgrounds, setShowBackgrounds,
    showParticipants, setShowParticipants, showReactions, setShowReactions, showPolls, setShowPolls,
    showBreakout, setShowBreakout, showSettings, setShowSettings, showMeetingInfo, setShowMeetingInfo,
    showWhiteboard, setShowWhiteboard,
    
    // Feature data states
    recordingTime, setRecordingTime, currentPoll, setCurrentPoll, polls, setPolls,

    // Refs
    localVideoRef, remoteStreams, setRemoteStreams, remoteVideosRef, peerConnectionsRef,
    localStreamRef, socketRef, audioContextRef, audioAnalyserRef, mediaRecorderRef, recordingIntervalRef
  } = useMeetingState();

  // Create state object for other hooks
  const state = {
    userId, setUserId, userName, setUserName, participants, setParticipants,
    participantNames, setParticipantNames, messages, setMessages, newMessage, setNewMessage,
    isMuted, setIsMuted, isVideoOn, setIsVideoOn, isScreenSharing, setIsScreenSharing,
    audioLevel, setAudioLevel, joinWithoutMedia, setJoinWithoutMedia, streamReady, setStreamReady,
    isHost, setIsHost, availableDevices, setAvailableDevices, currentDevices, setCurrentDevices,
    isRecording, setIsRecording, isPaused, setIsPaused, recordingDuration, setRecordingDuration,
    currentBackground, setCurrentBackground, breakoutRooms, setBreakoutRooms, currentRoom, setCurrentRoom,
    reactions, setReactions, showChat, setShowChat, showRecording, setShowRecording,
    showBackgrounds, setShowBackgrounds, showParticipants, setShowParticipants,
    showReactions, setShowReactions, showPolls, setShowPolls, showBreakout, setShowBreakout,
    showSettings, setShowSettings, showMeetingInfo, setShowMeetingInfo, showWhiteboard, setShowWhiteboard,
    recordingTime, setRecordingTime, currentPoll, setCurrentPoll, polls, setPolls,
    localVideoRef, remoteStreams, setRemoteStreams, remoteVideosRef, peerConnectionsRef,
    localStreamRef, socketRef, audioContextRef, audioAnalyserRef, mediaRecorderRef, recordingIntervalRef
  };

  // Get WebRTC and media control functions
  const webRTC = useWebRTC(state, meetingId);
  const mediaControls = useMediaControls(state);
  
  // Get meeting logic functions
  const meetingLogic = useMeetingLogic(state, meetingId, webRTC, mediaControls);

  // Initialize meeting when component mounts
  useEffect(() => {
    meetingLogic.initializeMeeting();
    
    return () => {
      meetingLogic.cleanup();
    };
  }, [meetingId]);

  // Handle toggle functions for components that still need external control
  const handleToggleWhiteboard = () => setShowWhiteboard(!showWhiteboard);
  const handleToggleChat = () => setShowChat(!showChat);

  // Handle reactions
  const handleSendReaction = (reactionData) => {
    // Handle both emoji string and reaction object
    const reaction = typeof reactionData === 'string' 
      ? {
          id: Date.now(),
          emoji: reactionData,
          userId,
          timestamp: Date.now()
        }
      : {
          id: reactionData.id || Date.now(),
          emoji: reactionData.emoji || reactionData.reaction || '👍',
          userId: reactionData.userId || userId,
          timestamp: reactionData.timestamp || Date.now()
        };
    
    setReactions(prev => [...prev, reaction]);
    
    // Send to other participants via socket
    if (socketRef.current) {
      socketRef.current.emit('send-reaction', {
        meetingId,
        id: reaction.id,
        userId: reaction.userId,
        emoji: reaction.emoji,
        timestamp: reaction.timestamp
      });
    }
    
    // Remove reaction after 3 seconds
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== reaction.id));
    }, 3000);
  };

  // Handle recording
  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    const interval = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
    window.recordingInterval = interval;
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setRecordingTime(0);
    if (window.recordingInterval) {
      clearInterval(window.recordingInterval);
    }
  };

  // Handle background effects
  const handleApplyBackground = (background) => {
    setCurrentBackground(background);
    console.log('Applying background:', background);
  };

  return (
    <MeetingLayout
      meetingId={meetingId}
      participants={participants}
      userName={userName}
      showChat={showChat}
      onToggleChat={handleToggleChat}
      reactions={reactions}
      
      // Video Grid props
      localVideoRef={localVideoRef}
      remoteStreams={remoteStreams}
      participantNames={participantNames}
      userId={userId}
      isMuted={isMuted}
      joinWithoutMedia={joinWithoutMedia}
      audioLevel={audioLevel}
      isScreenSharing={isScreenSharing}
      currentBackground={currentBackground}
      isVideoOn={isVideoOn}
      
      // Meeting Controls props
      onToggleMute={mediaControls.toggleMute}
      onToggleVideo={mediaControls.toggleVideo}
      onToggleScreenShare={mediaControls.toggleScreenShare}
      onLeaveMeeting={meetingLogic.leaveMeeting}
      
      // Feature Controls props - pass all needed props for feature components
      isRecording={isRecording}
      isPaused={isPaused}
      recordingTime={recordingTime}
      onStartRecording={handleStartRecording}
      onStopRecording={handleStopRecording}
      onPauseRecording={() => setIsPaused(true)}
      onResumeRecording={() => setIsPaused(false)}
      
      onApplyBackground={handleApplyBackground}
      onRemoveBackground={() => setCurrentBackground(null)}
      
      isHost={isHost}
      socketRef={socketRef}
      
      onSendReaction={handleSendReaction}
      
      breakoutRooms={breakoutRooms}
      currentRoom={currentRoom}
      onCreateRooms={(rooms) => setBreakoutRooms(rooms)}
      onJoinRoom={(roomId) => setCurrentRoom(roomId)}
      onCloseRooms={() => {
        setBreakoutRooms([]);
        setCurrentRoom(null);
      }}
      
      availableDevices={availableDevices}
      currentDevices={currentDevices}
      onCameraChange={(deviceId) => setCurrentDevices(prev => ({ ...prev, camera: deviceId }))}
      onMicrophoneChange={(deviceId) => setCurrentDevices(prev => ({ ...prev, microphone: deviceId }))}
      onSpeakerChange={(deviceId) => setCurrentDevices(prev => ({ ...prev, speaker: deviceId }))}
      
      onToggleWhiteboard={handleToggleWhiteboard}
      showWhiteboard={showWhiteboard}
      
      // Chat Panel props
      messages={messages}
      newMessage={newMessage}
      setNewMessage={setNewMessage}
      onSendMessage={meetingLogic.sendMessage}
    >
    </MeetingLayout>
  );
};

export default MeetingRoom;