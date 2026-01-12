import { useState } from 'react';
import { FaUsers, FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaCrown, FaUserTimes, FaVolumeMute } from 'react-icons/fa';

const ParticipantsList = ({ 
  participants, 
  participantNames, 
  currentUserId, 
  isHost = false,
  onMuteParticipant,
  onRemoveParticipant,
  onMakeHost,
  participantStates = {} // { userId: { isMuted, isVideoOn, isHost } }
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Participants Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center transition-all duration-200"
        title="Participants"
      >
        <div className="flex items-center space-x-1">
          <FaUsers className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="text-xs sm:text-sm font-medium">{participants.length}</span>
        </div>
      </button>

      {/* Modal positioned above control bar */}
      {isOpen && (
       <>
         {/* Backdrop - Excludes bottom area where control bar is */}
         <div
           className="fixed left-0 right-0 top-0 bg-black bg-opacity-50 z-[9998]"
           style={{
             bottom: '120px' // Don't cover the control bar area (control bar is at bottom-3 + height ~80px)
           }}
           onClick={() => setIsOpen(false)}
         />
          
         {/* Modal Panel - Positioned above control bar */}
         <div
           className="fixed left-1/2 transform -translate-x-1/2 z-[9999] w-11/12 max-w-md bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col"
           style={{
             bottom: 'clamp(100px, 12vh, 140px)', // Responsive: well above control bar on all screen sizes
             maxHeight: 'min(400px, calc(100vh - 200px))' // Responsive max height
           }}
         >
            <div className="p-4 border-b flex items-center justify-between flex-shrink-0">
              <h3 className="font-semibold text-gray-800 flex items-center">
                <FaUsers className="mr-2" />
                Participants ({participants.length})
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {participants.map((participantId) => {
                const isCurrentUser = participantId === currentUserId;
                const participantName = participantNames[participantId] || `Participant ${participantId.substring(0, 6)}...`;
                const state = participantStates[participantId] || {};
                
                return (
                  <div key={participantId} className="p-3 hover:bg-gray-50 flex items-center justify-between border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                        {participantName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-800 flex items-center truncate">
                          <span className="truncate">{participantName}</span>
                          {isCurrentUser && <span className="text-xs text-gray-500 ml-2 flex-shrink-0">(You)</span>}
                          {state.isHost && <FaCrown className="text-yellow-500 ml-2 text-xs flex-shrink-0" title="Host" />}
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                          {state.isMuted ? (
                            <FaMicrophoneSlash className="text-red-500" title="Muted" />
                          ) : (
                            <FaMicrophone className="text-green-500" title="Unmuted" />
                          )}
                          {state.isVideoOn ? (
                            <FaVideo className="text-green-500" title="Video on" />
                          ) : (
                            <FaVideoSlash className="text-red-500" title="Video off" />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Host Controls */}
                    {isHost && !isCurrentUser && (
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <button
                          onClick={() => onMuteParticipant?.(participantId)}
                          className="p-2 hover:bg-gray-200 rounded text-gray-600"
                          title="Mute participant"
                        >
                          <FaVolumeMute className="text-xs" />
                        </button>
                        <button
                          onClick={() => onMakeHost?.(participantId)}
                          className="p-2 hover:bg-gray-200 rounded text-gray-600"
                          title="Make host"
                        >
                          <FaCrown className="text-xs" />
                        </button>
                        <button
                          onClick={() => onRemoveParticipant?.(participantId)}
                          className="p-2 hover:bg-red-100 rounded text-red-600"
                          title="Remove participant"
                        >
                          <FaUserTimes className="text-xs" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ParticipantsList;