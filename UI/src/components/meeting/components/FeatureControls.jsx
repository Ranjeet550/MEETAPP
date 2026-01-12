import { useState } from 'react';
import {
  FaPencilAlt,
  FaEllipsisH,
  FaPollH,
  FaUsers,
  FaCog,
  FaInfoCircle
} from 'react-icons/fa';

// Import feature components
import RecordingControls from '../features/RecordingControls';
import BackgroundEffects from '../features/BackgroundEffects';
import ParticipantsList from '../features/ParticipantsList';
import Reactions from '../features/Reactions';
import Polls from '../features/Polls';
import BreakoutRooms from '../features/BreakoutRooms';
import MeetingSettings from '../features/MeetingSettings';
import MeetingInfo from '../features/MeetingInfo';
import Whiteboard from '../features/Whiteboard';

const FeatureControls = ({ 
  isRecording = false,
  isPaused = false,
  recordingTime = 0,
  onStartRecording = () => {},
  onStopRecording = () => {},
  onPauseRecording = () => {},
  onResumeRecording = () => {},

  currentBackground = null,
  onApplyBackground = () => {},
  onRemoveBackground = () => {},

  participants = [],
  participantNames = {},
  userId = '',
  userName = '',
  isHost = false,
  socketRef = null,
  meetingId = '',

  reactions = [],
  onSendReaction = () => {},

  breakoutRooms = [],
  currentRoom = null,
  onCreateRooms = () => {},
  onJoinRoom = () => {},
  onCloseRooms = () => {},

  availableDevices = { cameras: [], microphones: [], speakers: [] },
  currentDevices = { camera: '', microphone: '', speaker: '' },
  onCameraChange = () => {},
  onMicrophoneChange = () => {},
  onSpeakerChange = () => {},

  showWhiteboard = false,
  onToggleWhiteboard = () => {}
}) => {
  const [showMoreControls, setShowMoreControls] = useState(false);
  const [activeFeatureTab, setActiveFeatureTab] = useState(null);

  // Responsive button/icon size classes
  const BTN_SIZE = "w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10";
  const ICON_SIZE = "w-4 h-4 xs:w-4 xs:h-4 sm:w-5 sm:h-5";
  const BTN_ROUND = "rounded-xl flex items-center justify-center transition-all duration-200";

  return (
    <div className="flex items-center gap-x-1 xs:gap-x-2 sm:gap-x-2">
      {/* Recording Controls - Responsive */}
      <div className="hidden xs:flex">
        <RecordingControls
          isRecording={isRecording}
          isPaused={isPaused}
          recordingDuration={recordingTime}
          onStartRecording={onStartRecording}
          onStopRecording={onStopRecording}
          onPauseRecording={onPauseRecording}
          onResumeRecording={onResumeRecording}
        />
      </div>

      {/* Background Effects - Responsive */}
      <div className="hidden xs:flex">
        <BackgroundEffects
          currentBackground={currentBackground}
          onApplyBackground={onApplyBackground}
          onRemoveBackground={onRemoveBackground}
        />
      </div>

      {/* Participants List - Always available, but place in dropdown for mobile */}
      <div className="hidden sm:flex">
        <ParticipantsList
          participants={participants}
          participantNames={participantNames}
          currentUserId={userId}
          isHost={isHost}
          onMuteParticipant={(participantId) => {
            if (socketRef?.current) {
              socketRef.current.emit('mute-participant', { meetingId, participantId });
            }
          }}
          onRemoveParticipant={(participantId) => {
            if (socketRef?.current) {
              socketRef.current.emit('remove-participant', { meetingId, participantId });
            }
          }}
          onMakeHost={(participantId) => {
            if (socketRef?.current) {
              socketRef.current.emit('make-host', { meetingId, participantId });
            }
          }}
          participantStates={participants.reduce((acc, id) => ({
            ...acc,
            [id]: {
              isMuted: id === userId ? false : false,
              isVideoOn: id === userId ? true : true,
              isHost: id === userId ? isHost : false
            }
          }), {})}
        />
      </div>

      {/* Whiteboard Button */}
      <button
        onClick={onToggleWhiteboard}
        className={`${BTN_SIZE} ${BTN_ROUND} ${
          showWhiteboard
            ? 'bg-blue-500 text-white'
            : 'bg-gray-700 hover:bg-gray-600 text-white'
        } cursor-pointer`}
        title="Whiteboard"
      >
        <FaPencilAlt className="w-3 h-3 xs:w-4 xs:h-4 sm:w-4 sm:h-4" />
      </button>

      {/* Reactions - Always show; Reactions component should itself be responsive */}
      <Reactions 
        onSendReaction={onSendReaction}
        reactions={reactions}
        socketRef={socketRef}
        meetingId={meetingId}
        userId={userId}
        className="hidden xs:block"
      />

      {/* More Controls Button - Always available */}
      <div className="relative">
        <button
          onClick={() => setShowMoreControls(!showMoreControls)}
          className={`${BTN_SIZE} ${BTN_ROUND} bg-gray-700 hover:bg-gray-600 text-white cursor-pointer`}
          title="More controls"
          aria-haspopup="true"
          aria-expanded={showMoreControls}
        >
          <FaEllipsisH className="w-3 h-3 xs:w-4 xs:h-4 sm:w-4 sm:h-4" />
        </button>

        {/* More Controls Dropdown/Sheet */}
        {showMoreControls && (
          <>
            {/* Backdrop for mobile */}
            <div
              className="fixed inset-0 bg-black/50 z-[60] md:hidden"
              onClick={() => setShowMoreControls(false)}
            />
            {/* Panel: bottom-sheet (mobile) or dropdown (md+) */}
            <div className={`
              absolute z-[70] bg-white rounded-xl shadow-xl border
              w-full left-0 right-0
              fixed bottom-0 md:left-auto md:right-0 md:top-auto md:absolute md:bottom-full md:mb-2 md:w-80
              max-w-full md:max-w-xs
            `}>
              <div className="p-4 border-b md:hidden">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">More Controls</h3>
                  <button
                    onClick={() => setShowMoreControls(false)}
                    className="text-gray-500 hover:text-gray-700 text-xl cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              </div>
              {/* Controls Grid, more dense for xs/sm */}
              <div className="p-3 grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3 max-h-80 overflow-y-auto">
                {/* Polls */}
                <button
                  onClick={() => {
                    setActiveFeatureTab('polls');
                    setShowMoreControls(false);
                  }}
                  className="w-full h-11 sm:h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-all duration-200 font-medium text-xs sm:text-sm cursor-pointer"
                >
                  <FaPollH className="w-4 h-4 mr-2" />
                  Polls
                </button>
                {/* Breakout Rooms - Host only */}
                {isHost && (
                  <button
                    onClick={() => {
                      setActiveFeatureTab('breakout');
                      setShowMoreControls(false);
                    }}
                    className="w-full h-11 sm:h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-all duration-200 font-medium text-xs sm:text-sm cursor-pointer"
                  >
                    <FaUsers className="w-4 h-4 mr-2" />
                    Breakout
                  </button>
                )}
                {/* Settings */}
                <button
                  onClick={() => {
                    setActiveFeatureTab('settings');
                    setShowMoreControls(false);
                  }}
                  className="w-full h-11 sm:h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-all duration-200 font-medium text-xs sm:text-sm cursor-pointer"
                >
                  <FaCog className="w-4 h-4 mr-2" />
                  Settings
                </button>
                {/* Meeting Info */}
                <button
                  onClick={() => {
                    setActiveFeatureTab('info');
                    setShowMoreControls(false);
                  }}
                  className="w-full h-11 sm:h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-all duration-200 font-medium text-xs sm:text-sm cursor-pointer"
                >
                  <FaInfoCircle className="w-4 h-4 mr-2" />
                  Info
                </button>
                {/* Show Participants on mobile/hidden on sm+ (always show in dropdown for small screens) */}
                <button
                  onClick={() => {
                    setActiveFeatureTab('participants');
                    setShowMoreControls(false);
                  }}
                  className="w-full h-11 sm:h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-all duration-200 font-medium text-xs sm:text-sm block sm:hidden cursor-pointer"
                >
                  <FaUsers className="w-4 h-4 mr-2" />
                  Participants
                </button>
                {/* Show Recording on mobile/hidden on xs+ */}
                <button
                  onClick={() => {
                    setActiveFeatureTab('recording');
                    setShowMoreControls(false);
                  }}
                  className="w-full h-11 sm:h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-all duration-200 font-medium text-xs sm:text-sm block xs:hidden cursor-pointer"
                >
                  <FaCog className="w-4 h-4 mr-2" />
                  Recording
                </button>
                {/* Show BG Effects on mobile */}
                <button
                  onClick={() => {
                    setActiveFeatureTab('background');
                    setShowMoreControls(false);
                  }}
                  className="w-full h-11 sm:h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-all duration-200 font-medium text-xs sm:text-sm block xs:hidden cursor-pointer"
                >
                  <FaPencilAlt className="w-4 h-4 mr-2" />
                  Background
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modals for additional features; they open full-screen modals on mobile, as panels on desktop */}
      {/* Polls Modal */}
      {activeFeatureTab === 'polls' && (
        <Polls
          open={true}
          onClose={() => setActiveFeatureTab(null)}
          socketRef={socketRef}
          meetingId={meetingId}
          userId={userId}
        />
      )}

      {/* Breakout Modal */}
      {(activeFeatureTab === 'breakout' && isHost) && (
        <BreakoutRooms
          open={true}
          onClose={() => setActiveFeatureTab(null)}
          isHost={isHost}
          participants={participants}
          participantNames={participantNames}
          onCreateRooms={onCreateRooms}
          onJoinRoom={onJoinRoom}
          onCloseRooms={onCloseRooms}
          breakoutRooms={breakoutRooms}
          currentRoom={currentRoom}
        />
      )}

      {/* Settings Modal */}
      {activeFeatureTab === 'settings' && (
        <MeetingSettings
          open={true}
          onClose={() => setActiveFeatureTab(null)}
          onCameraChange={onCameraChange}
          onMicrophoneChange={onMicrophoneChange}
          onSpeakerChange={onSpeakerChange}
          availableDevices={availableDevices}
          currentDevices={currentDevices}
        />
      )}

      {/* Info Modal */}
      {activeFeatureTab === 'info' && (
        <MeetingInfo
          open={true}
          onClose={() => setActiveFeatureTab(null)}
          meetingId={meetingId}
          meetingLink={`${window.location.origin}/meeting/${meetingId}`}
          userName={userName}
        />
      )}

      {/* Participants Modal, responsive for xs/sm/mobile */}
      {activeFeatureTab === 'participants' && (
        <ParticipantsList
          participants={participants}
          participantNames={participantNames}
          currentUserId={userId}
          isHost={isHost}
          onMuteParticipant={(participantId) => {
            if (socketRef?.current) {
              socketRef.current.emit('mute-participant', { meetingId, participantId });
            }
          }}
          onRemoveParticipant={(participantId) => {
            if (socketRef?.current) {
              socketRef.current.emit('remove-participant', { meetingId, participantId });
            }
          }}
          onMakeHost={(participantId) => {
            if (socketRef?.current) {
              socketRef.current.emit('make-host', { meetingId, participantId });
            }
          }}
          participantStates={participants.reduce((acc, id) => ({
            ...acc,
            [id]: {
              isMuted: id === userId ? false : false,
              isVideoOn: id === userId ? true : true,
              isHost: id === userId ? isHost : false
            }
          }), {})}
          // Show as modal/panel for mobile
          open={true}
          onClose={() => setActiveFeatureTab(null)}
        />
      )}

      {/* Recording Modal for mobile */}
      {activeFeatureTab === 'recording' && (
        <RecordingControls
          isRecording={isRecording}
          isPaused={isPaused}
          recordingDuration={recordingTime}
          onStartRecording={onStartRecording}
          onStopRecording={onStopRecording}
          onPauseRecording={onPauseRecording}
          onResumeRecording={onResumeRecording}
          open={true}
          onClose={() => setActiveFeatureTab(null)}
        />
      )}

      {/* BG Effects Modal for mobile */}
      {activeFeatureTab === 'background' && (
        <BackgroundEffects
          currentBackground={currentBackground}
          onApplyBackground={onApplyBackground}
          onRemoveBackground={onRemoveBackground}
          open={true}
          onClose={() => setActiveFeatureTab(null)}
        />
      )}

      {/* Whiteboard Modal */}
      {showWhiteboard && (
        <Whiteboard
          isOpen={showWhiteboard}
          onClose={onToggleWhiteboard}
          socketRef={socketRef}
          meetingId={meetingId}
          userId={userId}
        />
      )}
    </div>
  );
};

export default FeatureControls;