import { useState } from 'react';
import { FaUsers, FaPlus, FaArrowRight, FaDoorOpen } from 'react-icons/fa';

const BreakoutRooms = ({ 
  isHost = false,
  participants = [],
  participantNames = {},
  onCreateRooms,
  onJoinRoom,
  onCloseRooms,
  breakoutRooms = [],
  currentRoom = null,
  contentOnly = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roomCount, setRoomCount] = useState(2);
  const [assignmentType, setAssignmentType] = useState('automatic');

  const createRooms = () => {
    const rooms = [];
    for (let i = 1; i <= roomCount; i++) {
      rooms.push({
        id: `room-${i}`,
        name: `Room ${i}`,
        participants: []
      });
    }

    if (assignmentType === 'automatic') {
      const shuffled = [...participants].sort(() => 0.5 - Math.random());
      shuffled.forEach((participant, index) => {
        const roomIndex = index % roomCount;
        rooms[roomIndex].participants.push(participant);
      });
    }

    onCreateRooms?.(rooms);
    setShowCreateModal(false);
  };

  const renderContent = (onClose) => (
    <div className="flex-1 flex flex-col h-full bg-white rounded-2xl overflow-hidden relative">
      <div className="p-4 border-b flex justify-between items-center bg-gray-50">
        <h3 className="font-bold text-gray-800">Breakout Rooms</h3>
        <div className="flex items-center gap-2">
          {isHost && breakoutRooms.length === 0 && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-bold transition-all shadow-sm"
            >
              <FaPlus className="inline mr-1" />
              Create
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl font-bold leading-none w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
              aria-label="Close breakout rooms"
            >
              ×
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {breakoutRooms.length > 0 ? (
          <div className="space-y-4">
            {breakoutRooms.map((room) => (
              <div key={room.id} className="border-2 border-gray-100 rounded-2xl p-4 bg-white hover:border-blue-100 transition-all">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h4 className="font-bold text-gray-800 flex items-center">
                      <FaDoorOpen className="mr-2 text-blue-500" />
                      {room.name}
                    </h4>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {room.participants.length} Participants
                    </span>
                  </div>
                  {currentRoom !== room.id && (
                    <button
                      onClick={() => onJoinRoom?.(room.id)}
                      className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-xl text-sm font-bold transition-all"
                    >
                      Join
                    </button>
                  )}
                  {currentRoom === room.id && (
                    <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase">You are here</span>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {room.participants.map((participantId) => (
                    <div key={participantId} className="flex items-center space-x-2 bg-gray-50 p-2 rounded-lg border border-gray-100">
                      <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-[10px] font-bold text-blue-700">
                        {(participantNames[participantId] || 'U').charAt(0)}
                      </div>
                      <span className="text-xs font-medium text-gray-600 truncate">
                        {participantNames[participantId] || 'User'}
                      </span>
                    </div>
                  ))}
                  {room.participants.length === 0 && (
                    <div className="col-span-2 text-center py-2 text-xs text-gray-400 italic font-medium">No participants yet</div>
                  )}
                </div>
              </div>
            ))}

            {isHost && (
              <button
                onClick={() => {
                  onCloseRooms?.();
                }}
                className="w-full bg-red-50 hover:bg-red-100 text-red-600 py-3 rounded-xl font-bold transition-all border border-red-100"
              >
                Close All Rooms
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-12 px-6">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaUsers className="text-3xl text-gray-300" />
            </div>
            <h5 className="font-bold text-gray-800">No rooms active</h5>
            <p className="text-sm text-gray-500 mt-2">
              {isHost ? "Split your participants into smaller groups for discussion." : "Wait for the host to start breakout sessions."}
            </p>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="absolute inset-0 bg-white z-[20] flex flex-col">
          <div className="p-4 border-b flex items-center justify-between bg-gray-50">
            <h3 className="font-bold text-gray-800">Setup Breakout Rooms</h3>
            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl px-2">×</button>
          </div>
          <div className="p-6 flex-1 overflow-y-auto space-y-8">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Number of Rooms</label>
              <div className="flex items-center space-x-6">
                <input
                  type="range"
                  min="2"
                  max="10"
                  value={roomCount}
                  onChange={(e) => setRoomCount(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <span className="w-12 h-12 flex items-center justify-center bg-blue-600 text-white rounded-2xl font-bold text-xl shadow-lg shadow-blue-100">
                  {roomCount}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Assignment Mode</label>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setAssignmentType('automatic')}
                  className={`p-4 rounded-2xl border-2 transition-all text-left ${assignmentType === 'automatic' ? 'border-blue-500 bg-blue-50' : 'border-gray-100'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${assignmentType === 'automatic' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <FaArrowRight className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-sm text-gray-800">Automatic</div>
                  <div className="text-[10px] text-gray-500 mt-1">Assign participants randomly</div>
                </button>
                <button 
                  onClick={() => setAssignmentType('manual')}
                  className={`p-4 rounded-2xl border-2 transition-all text-left ${assignmentType === 'manual' ? 'border-blue-500 bg-blue-50' : 'border-gray-100'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${assignmentType === 'manual' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <FaUsers className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-sm text-gray-800">Manual</div>
                  <div className="text-[10px] text-gray-500 mt-1">Let me choose who goes where</div>
                </button>
              </div>
            </div>
          </div>
          <div className="p-4 border-t bg-gray-50 flex space-x-3">
            <button onClick={() => setShowCreateModal(false)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-200 rounded-xl transition-all">Cancel</button>
            <button onClick={createRooms} className="flex-1 py-3 bg-blue-600 text-white font-bold hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-100 transition-all">Start Sessions</button>
          </div>
        </div>
      )}
    </div>
  );

  if (contentOnly) return renderContent();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`w-full h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
          breakoutRooms.length > 0 
            ? 'bg-purple-600 text-white shadow-lg shadow-purple-100' 
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        }`}
      >
        <FaUsers className="w-4 h-4 mr-2" />
        <span className="text-sm font-bold">Breakout</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop - Excludes bottom area where control bar is */}
          <div 
            className="fixed left-0 right-0 top-0 bg-black bg-opacity-50 z-[10000]"
            style={{ 
              bottom: '120px' // Don't cover the control bar area (control bar is at bottom-3 + height ~80px)
            }}
            onClick={() => setIsOpen(false)}
          />
          
          {/* Modal Panel - Positioned above control bar */}
          <div 
            className="fixed left-1/2 transform -translate-x-1/2 z-[10001] w-[90%] max-w-md"
            style={{ 
              bottom: 'clamp(100px, 12vh, 140px)', // Responsive: well above control bar on all screen sizes
              maxHeight: 'min(400px, calc(100vh - 200px))' // Responsive max height
            }}
          >
            {renderContent(() => setIsOpen(false))}
          </div>
        </>
      )}
    </>
  );
};

export default BreakoutRooms;
