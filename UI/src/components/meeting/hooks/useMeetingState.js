import { useState, useRef } from 'react';

export const useMeetingState = () => {
  // User and meeting state
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [participants, setParticipants] = useState([]);
  const [participantNames, setParticipantNames] = useState({});
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  // Media state
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [mediaPermissions, setMediaPermissions] = useState({
    camera: 'unknown',
    microphone: 'unknown'
  });
  const [joinWithoutMedia, setJoinWithoutMedia] = useState(false);
  const [streamReady, setStreamReady] = useState(false);

  // Feature states
  const [isHost, setIsHost] = useState(false);
  const [availableDevices, setAvailableDevices] = useState({
    cameras: [],
    microphones: [],
    speakers: []
  });
  const [currentDevices, setCurrentDevices] = useState({
    camera: '',
    microphone: '',
    speaker: ''
  });
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [currentBackground, setCurrentBackground] = useState(null);
  const [breakoutRooms, setBreakoutRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [reactions, setReactions] = useState([]);
  const [meetingStartTime] = useState(Date.now());
  const [participantStates, setParticipantStates] = useState({});
  
  // UI state
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showChat, setShowChat] = useState(false);
  
  // Feature panel states
  const [showRecording, setShowRecording] = useState(false);
  const [showBackgrounds, setShowBackgrounds] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showPolls, setShowPolls] = useState(false);
  const [showBreakout, setShowBreakout] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMeetingInfo, setShowMeetingInfo] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  
  // Feature data states
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentPoll, setCurrentPoll] = useState(null);
  const [polls, setPolls] = useState([]);

  // Refs
  const localVideoRef = useRef(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const remoteVideosRef = useRef({});
  const peerConnectionsRef = useRef({});
  const localStreamRef = useRef(null);
  const socketRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioAnalyserRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordingIntervalRef = useRef(null);

  return {
    // User and meeting state
    userId, setUserId,
    userName, setUserName,
    participants, setParticipants,
    participantNames, setParticipantNames,
    messages, setMessages,
    newMessage, setNewMessage,
    
    // Media state
    isMuted, setIsMuted,
    isVideoOn, setIsVideoOn,
    isScreenSharing, setIsScreenSharing,
    audioLevel, setAudioLevel,
    mediaPermissions, setMediaPermissions,
    joinWithoutMedia, setJoinWithoutMedia,
    streamReady, setStreamReady,

    // Feature states
    isHost, setIsHost,
    availableDevices, setAvailableDevices,
    currentDevices, setCurrentDevices,
    isRecording, setIsRecording,
    isPaused, setIsPaused,
    recordingDuration, setRecordingDuration,
    currentBackground, setCurrentBackground,
    breakoutRooms, setBreakoutRooms,
    currentRoom, setCurrentRoom,
    reactions, setReactions,
    meetingStartTime,
    participantStates, setParticipantStates,
    
    // UI state
    showMobileMenu, setShowMobileMenu,
    showChat, setShowChat,
    
    // Feature panel states
    showRecording, setShowRecording,
    showBackgrounds, setShowBackgrounds,
    showParticipants, setShowParticipants,
    showReactions, setShowReactions,
    showPolls, setShowPolls,
    showBreakout, setShowBreakout,
    showSettings, setShowSettings,
    showMeetingInfo, setShowMeetingInfo,
    showWhiteboard, setShowWhiteboard,
    
    // Feature data states
    recordingTime, setRecordingTime,
    currentPoll, setCurrentPoll,
    polls, setPolls,

    // Refs
    localVideoRef,
    remoteStreams, setRemoteStreams,
    remoteVideosRef,
    peerConnectionsRef,
    localStreamRef,
    socketRef,
    audioContextRef,
    audioAnalyserRef,
    mediaRecorderRef,
    recordingIntervalRef
  };
};