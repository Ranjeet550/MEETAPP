import React from 'react';
import { FaCircle, FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaUsers } from 'react-icons/fa';

const getPanelWidth = (maxW) =>
  `w-[98vw] sm:w-11/12 ${maxW} max-h-[94vh] sm:max-h-[85vh]`;

const ModalWrapper = ({ children, maxW = "max-w-md", testId }) => (
  <>
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[51]" />
    <div
      data-testid={testId}
      className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${getPanelWidth(maxW)} bg-white rounded-xl shadow-2xl z-[52] flex flex-col overflow-x-hidden overflow-y-auto`}
      style={{
        width: '98vw',
        maxWidth: maxW.startsWith('max-w-') ? undefined : maxW,
      }}
    >
      {children}
    </div>
  </>
);

const FeaturePanels = ({
  // Recording panel
  showRecording,
  isRecording,
  recordingTime,
  handleStartRecording,
  handleStopRecording,

  // Background panel
  showBackgrounds,
  currentBackground,
  applyBackground,

  // Participants panel
  showParticipants,
  participants,
  userId,
  userName,
  isHost,
  participantNames,
  isMuted,
  isVideoOn,

  // Reactions panel
  showReactions,
  handleSendReaction,

  // Polls panel
  showPolls,
  currentPoll,
  handleCreatePoll,
  handleVotePoll,

  // Breakout rooms panel
  showBreakout,
  breakoutRooms,
  createBreakoutRooms,
  joinBreakoutRoom,
  closeBreakoutRooms,

  // Settings panel
  showSettings,
  availableDevices,
  currentDevices,
  handleCameraChange,
  handleMicrophoneChange,
  setCurrentDevices,

  // Meeting info panel
  showMeetingInfo,
  meetingId,
  meetingStartTime
}) => {
  return (
    <>
      {/* Recording Panel */}
      {showRecording && (
        <ModalWrapper maxW="max-w-xs" testId="modal-recording">
          <div className="p-3 sm:p-4 border-b">
            <h3 className="font-semibold text-gray-900 text-lg sm:text-base">Recording</h3>
          </div>
          <div className="p-3 sm:p-4 flex-1 flex flex-col justify-center">
            {!isRecording ? (
              <div className="space-y-3">
                <p className="text-xs sm:text-sm text-gray-600">Start recording this meeting</p>
                <button
                  onClick={handleStartRecording}
                  className="w-full bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  <FaCircle className="w-3 h-3" />
                  <span>Start Recording</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-red-600 justify-center">
                  <FaCircle className="w-3 h-3 animate-pulse" />
                  <span className="font-medium">Recording</span>
                  <span className="text-xs sm:text-sm">
                    {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                <button
                  onClick={handleStopRecording}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg font-medium transition-colors text-sm cursor-pointer"
                >
                  Stop Recording
                </button>
              </div>
            )}
          </div>
        </ModalWrapper>
      )}

      {/* Background Effects Panel */}
      {showBackgrounds && (
        <ModalWrapper maxW="max-w-md" testId="modal-backgrounds">
          <div className="p-3 sm:p-4 border-b">
            <h3 className="font-semibold text-gray-900 text-lg sm:text-base">Background Effects</h3>
          </div>
          <div className="p-3 sm:p-4">
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-3">
              <button
                onClick={() => applyBackground(null)}
                className={`aspect-video rounded-lg border-2 transition-colors ${
                  !currentBackground ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                } cursor-pointer`}
              >
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-600">
                  None
                </div>
              </button>
              <button
                onClick={() => applyBackground('blur')}
                className={`aspect-video rounded-lg border-2 transition-colors ${
                  currentBackground === 'blur' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                } cursor-pointer`}
              >
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-400 rounded flex items-center justify-center text-xs text-white">
                  Blur
                </div>
              </button>
              <button
                onClick={() => applyBackground('office')}
                className={`aspect-video rounded-lg border-2 transition-colors ${
                  currentBackground === 'office' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                } cursor-pointer`}
              >
                <div className="w-full h-full bg-gradient-to-br from-blue-200 to-blue-400 rounded flex items-center justify-center text-xs text-white">
                  Office
                </div>
              </button>
              <button
                onClick={() => applyBackground('nature')}
                className={`aspect-video rounded-lg border-2 transition-colors ${
                  currentBackground === 'nature' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                } cursor-pointer`}
              >
                <div className="w-full h-full bg-gradient-to-br from-green-200 to-green-400 rounded flex items-center justify-center text-xs text-white">
                  Nature
                </div>
              </button>
              <button
                onClick={() => applyBackground('space')}
                className={`aspect-video rounded-lg border-2 transition-colors ${
                  currentBackground === 'space' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                } cursor-pointer`}
              >
                <div className="w-full h-full bg-gradient-to-br from-purple-200 to-purple-400 rounded flex items-center justify-center text-xs text-white">
                  Space
                </div>
              </button>
              <button
                onClick={() => applyBackground('custom')}
                className={`aspect-video rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors flex items-center justify-center text-xs text-gray-500 cursor-pointer`}
              >
                Upload
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}

      {/* Participants Panel */}
      {showParticipants && (
        <ModalWrapper maxW="max-w-md" testId="modal-participants">
          <div className="p-3 sm:p-4 border-b flex-shrink-0">
            <h3 className="font-semibold text-gray-900 text-lg sm:text-base">Participants ({participants.length + 1})</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 sm:p-4">
            <div className="space-y-2">
              {/* Current User */}
              <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-0 p-2 sm:p-3 rounded-lg bg-blue-50">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{userName} (You)</p>
                    {isHost && <p className="text-xs text-blue-600">Host</p>}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {isMuted ? (
                    <FaMicrophoneSlash className="w-4 h-4 text-red-500" />
                  ) : (
                    <FaMicrophone className="w-4 h-4 text-green-500" />
                  )}
                  {isVideoOn ? (
                    <FaVideo className="w-4 h-4 text-green-500" />
                  ) : (
                    <FaVideoSlash className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>

              {/* Other Participants */}
              {participants.filter(p => p !== userId).map((participant) => {
                const participantName = participantNames[participant] || 'Unknown User';
                return (
                  <div key={participant} className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-0 p-2 sm:p-3 rounded-lg hover:bg-gray-50 border border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0">
                        {participantName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{participantName}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaMicrophone className="w-4 h-4 text-green-500" />
                      <FaVideo className="w-4 h-4 text-green-500" />
                      {isHost && (
                        <div className="relative">
                          <button className="text-gray-400 hover:text-gray-600 p-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ModalWrapper>
      )}

      {/* Reactions Panel */}
      {showReactions && (
        <ModalWrapper maxW="max-w-xs" testId="modal-reactions">
          <div className="p-3 sm:p-4 border-b">
            <h3 className="font-semibold text-gray-900 text-lg sm:text-base">Reactions</h3>
          </div>
          <div className="p-3 sm:p-4">
            <div className="grid grid-cols-4 xs:grid-cols-4 sm:grid-cols-4 gap-2 sm:gap-3">
              {['👍', '👏', '❤️', '😂', '😮', '😢', '🎉', '👋'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleSendReaction(emoji)}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center text-xl sm:text-2xl border border-gray-200 hover:border-gray-300 cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </ModalWrapper>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <ModalWrapper maxW="max-w-md" testId="modal-settings">
          <div className="p-3 sm:p-4 border-b">
            <h3 className="font-semibold text-gray-900 text-lg sm:text-base">Settings</h3>
          </div>
          <div className="p-3 sm:p-4 space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Camera</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={currentDevices.camera}
                onChange={(e) => handleCameraChange(e.target.value)}
              >
                {availableDevices.cameras.map((camera) => (
                  <option key={camera.deviceId} value={camera.deviceId}>
                    {camera.label || `Camera ${camera.deviceId.slice(0, 8)}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Microphone</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={currentDevices.microphone}
                onChange={(e) => handleMicrophoneChange(e.target.value)}
              >
                {availableDevices.microphones.map((mic) => (
                  <option key={mic.deviceId} value={mic.deviceId}>
                    {mic.label || `Microphone ${mic.deviceId.slice(0, 8)}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Speaker</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={currentDevices.speaker}
                onChange={(e) => setCurrentDevices(prev => ({ ...prev, speaker: e.target.value }))}
              >
                {availableDevices.speakers.map((speaker) => (
                  <option key={speaker.deviceId} value={speaker.deviceId}>
                    {speaker.label || `Speaker ${speaker.deviceId.slice(0, 8)}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2 border-t border-gray-200">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm cursor-pointer"
              >
                Refresh Connection
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}

      {/* Meeting Info Panel */}
      {showMeetingInfo && (
        <ModalWrapper maxW="max-w-md" testId="modal-meeting-info">
          <div className="p-3 sm:p-4 border-b">
            <h3 className="font-semibold text-gray-900 text-lg sm:text-base">Meeting Info</h3>
          </div>
          <div className="p-3 sm:p-4 space-y-4">
            <div>
              <label className="block text-[11px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">Meeting ID</label>
              <div className="flex items-center space-x-2 mt-1">
                <code className="flex-1 bg-gray-100 px-2 py-2 sm:px-3 rounded text-xs sm:text-sm font-mono break-all">{meetingId}</code>
                <button
                  onClick={() => navigator.clipboard.writeText(meetingId)}
                  className="text-blue-500 hover:text-blue-600 text-xs sm:text-sm font-medium cursor-pointer"
                >
                  Copy
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">Meeting Link</label>
              <div className="flex items-center space-x-2 mt-1">
                <input
                  type="text"
                  value={`${window.location.origin}/meeting/${meetingId}`}
                  readOnly
                  className="flex-1 bg-gray-100 px-2 py-2 sm:px-3 rounded text-xs sm:text-sm"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(`${window.location.origin}/meeting/${meetingId}`)}
                  className="text-blue-500 hover:text-blue-600 text-xs sm:text-sm font-medium cursor-pointer"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">Duration</label>
                <p className="text-base sm:text-lg font-semibold text-gray-900 mt-1">
                  {Math.floor((Date.now() - meetingStartTime) / 60000)}m
                </p>
              </div>
              <div>
                <label className="block text-[11px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">Participants</label>
                <p className="text-base sm:text-lg font-semibold text-gray-900 mt-1">{participants.length + 1}</p>
              </div>
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">Host</label>
              <p className="text-sm text-gray-900 mt-1">{userName}</p>
            </div>
          </div>
        </ModalWrapper>
      )}
    </>
  );
};

export default FeaturePanels;