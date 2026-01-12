import { useState } from 'react';
import { FaPoll, FaPlus, FaCheck, FaTrash } from 'react-icons/fa';

const Polls = ({ 
  isHost = false,
  socketRef,
  meetingId,
  userId,
  participantNames = {},
  contentOnly = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [polls, setPolls] = useState([]);
  const [activePoll, setActivePoll] = useState(null);
  const [newPoll, setNewPoll] = useState({
    question: '',
    options: ['', ''],
    allowMultiple: false
  });

  const createPoll = () => {
    if (!newPoll.question.trim() || newPoll.options.filter(o => o.trim()).length < 2) {
      return;
    }

    const poll = {
      id: Date.now(),
      question: newPoll.question,
      options: newPoll.options.filter(o => o.trim()),
      allowMultiple: newPoll.allowMultiple,
      votes: {},
      createdBy: userId,
      createdAt: Date.now()
    };

    if (socketRef?.current) {
      socketRef.current.emit('create-poll', { meetingId, poll });
    }

    setNewPoll({ question: '', options: ['', ''], allowMultiple: false });
    setShowCreatePoll(false);
  };

  const vote = (pollId, optionIndex) => {
    const poll = polls.find(p => p.id === pollId);
    if (!poll) return;

    let selectedOptions = poll.votes[userId] || [];
    
    if (poll.allowMultiple) {
      if (selectedOptions.includes(optionIndex)) {
        selectedOptions = selectedOptions.filter(o => o !== optionIndex);
      } else {
        selectedOptions = [...selectedOptions, optionIndex];
      }
    } else {
      selectedOptions = [optionIndex];
    }

    if (socketRef?.current) {
      socketRef.current.emit('poll-vote', {
        meetingId,
        pollId,
        userId,
        options: selectedOptions
      });
    }
  };

  const addOption = () => {
    setNewPoll(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const updateOption = (index, value) => {
    setNewPoll(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  const removeOption = (index) => {
    if (newPoll.options.length > 2) {
      setNewPoll(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  };

  const getPollResults = (poll) => {
    const totalVotes = Object.keys(poll.votes).length;
    return poll.options.map((option, index) => {
      const votes = Object.values(poll.votes).filter(userVotes => 
        userVotes.includes(index)
      ).length;
      return {
        option,
        votes,
        percentage: totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0
      };
    });
  };

  const renderContent = (onClose) => (
    <div className="flex-1 flex flex-col h-full bg-white rounded-2xl overflow-hidden relative">
      <div className="p-4 border-b flex justify-between items-center bg-gray-50">
        <h3 className="font-bold text-gray-800">Polls</h3>
        <div className="flex items-center gap-2">
          {isHost && (
            <button
              onClick={() => setShowCreatePoll(true)}
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
              aria-label="Close polls"
            >
              ×
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activePoll ? (
          <div>
            <h4 className="font-bold text-gray-800 mb-4">{activePoll.question}</h4>
            <div className="space-y-3">
              {activePoll.options.map((option, index) => {
                const userVotes = activePoll.votes[userId] || [];
                const isSelected = userVotes.includes(index);
                const results = getPollResults(activePoll);
                
                return (
                  <button
                    key={index}
                    onClick={() => vote(activePoll.id, index)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50 shadow-sm' 
                        : 'border-gray-100 hover:border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-700">{option}</span>
                      {isSelected && <FaCheck className="text-blue-500" />}
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-blue-500 h-full transition-all duration-500"
                        style={{ width: `${results[index].percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1 text-[10px] font-bold text-gray-400 uppercase">
                      <span>{results[index].votes} votes</span>
                      <span>{results[index].percentage}%</span>
                    </div>
                  </button>
                );
              })}
            </div>
            
            {isHost && (
              <button
                onClick={() => {
                  if (socketRef?.current) {
                    socketRef.current.emit('end-poll', { meetingId, pollId: activePoll.id });
                  }
                  setActivePoll(null);
                }}
                className="w-full mt-6 bg-red-50 hover:bg-red-100 text-red-600 py-3 rounded-xl font-bold transition-all border border-red-100"
              >
                End Poll
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-12 px-6">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaPoll className="text-3xl text-gray-300" />
            </div>
            <h5 className="font-bold text-gray-800">No active polls</h5>
            <p className="text-sm text-gray-500 mt-2">
              {isHost ? "Start a poll to get instant feedback from your team." : "Wait for the host to start a poll."}
            </p>
          </div>
        )}
      </div>

      {showCreatePoll && (
        <div className="absolute inset-0 bg-white z-[20] flex flex-col">
          <div className="p-4 border-b flex items-center justify-between bg-gray-50">
            <h3 className="font-bold text-gray-800">Create New Poll</h3>
            <button onClick={() => setShowCreatePoll(false)} className="text-gray-400 hover:text-gray-600 text-2xl px-2">×</button>
          </div>
          <div className="p-6 flex-1 overflow-y-auto space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Question</label>
              <input
                type="text"
                value={newPoll.question}
                onChange={(e) => setNewPoll(prev => ({ ...prev, question: e.target.value }))}
                className="w-full border-2 border-gray-100 focus:border-blue-500 rounded-xl px-4 py-3 outline-none transition-all font-medium"
                placeholder="What's on your mind?"
              />
            </div>
            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Options</label>
              {newPoll.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    className="flex-1 border-2 border-gray-100 focus:border-blue-500 rounded-xl px-4 py-2 outline-none transition-all"
                    placeholder={`Option ${index + 1}`}
                  />
                  {newPoll.options.length > 2 && (
                    <button onClick={() => removeOption(index)} className="text-red-400 hover:text-red-600 p-2 transition-colors">
                      <FaTrash />
                    </button>
                  )}
                </div>
              ))}
              <button 
                onClick={addOption} 
                className="text-blue-600 hover:text-blue-700 text-xs font-bold flex items-center px-2 py-1"
              >
                + Add Another Option
              </button>
            </div>
          </div>
          <div className="p-4 border-t bg-gray-50 flex space-x-3">
            <button onClick={() => setShowCreatePoll(false)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-200 rounded-xl transition-all">Cancel</button>
            <button onClick={createPoll} className="flex-1 py-3 bg-blue-600 text-white font-bold hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-100 transition-all">Launch Poll</button>
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
          activePoll 
            ? 'bg-green-500 text-white shadow-lg shadow-green-100' 
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        }`}
      >
        <FaPoll className="w-4 h-4 mr-2" />
        <span className="text-sm font-bold">Polls</span>
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
           className="fixed left-1/2 transform -translate-x-1/2 z-[10001] w-11/12 max-w-md bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col"
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

export default Polls;
