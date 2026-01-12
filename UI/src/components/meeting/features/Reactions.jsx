import { useState, useEffect } from 'react';
import { FaSmile, FaThumbsUp, FaHeart, FaLaugh, FaSurprise, FaSadTear } from 'react-icons/fa';
import './reactions.css';

const Reactions = ({ 
  onSendReaction,
  reactions = [],
  socketRef,
  meetingId,
  userId
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeReactions, setActiveReactions] = useState([]);

  const reactionEmojis = [
    { id: 'thumbsup', icon: FaThumbsUp, emoji: '👍', color: 'text-blue-500' },
    { id: 'heart', icon: FaHeart, emoji: '❤️', color: 'text-red-500' },
    { id: 'laugh', icon: FaLaugh, emoji: '😂', color: 'text-yellow-500' },
    { id: 'surprise', icon: FaSurprise, emoji: '😮', color: 'text-purple-500' },
    { id: 'sad', icon: FaSadTear, emoji: '😢', color: 'text-blue-400' },
    { id: 'clap', emoji: '👏', color: 'text-green-500' }
  ];

  useEffect(() => {
    if (socketRef?.current) {
      socketRef.current.on('reaction-received', (reactionData) => {
        if (reactionData.userId !== userId) {
          showReaction(reactionData);
        }
      });
    }

    return () => {
      if (socketRef?.current) {
        socketRef.current.off('reaction-received');
      }
    };
  }, [socketRef, userId]);

  const sendReaction = (reaction) => {
    const reactionData = {
      id: Date.now(),
      userId,
      reaction: reaction.id,
      emoji: reaction.emoji,
      timestamp: Date.now()
    };

    // Send to other participants
    if (socketRef?.current) {
      socketRef.current.emit('send-reaction', {
        meetingId,
        ...reactionData
      });
    }

    // Show locally
    showReaction(reactionData);
    onSendReaction?.(reactionData);
    setIsOpen(false);
  };

  const showReaction = (reactionData) => {
    setActiveReactions(prev => [...prev, reactionData]);
    
    // Remove reaction after animation completes (4s animation + small buffer)
    setTimeout(() => {
      setActiveReactions(prev => prev.filter(r => r.id !== reactionData.id));
    }, 4100);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center transition-all duration-200"
        title="Reactions"
      >
        <FaSmile className="w-3 h-3 sm:w-4 sm:h-4" />
      </button>

      {/* Modal positioned above control bar */}
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
            className="fixed left-1/2 transform -translate-x-1/2 z-[10001] w-11/12 max-w-sm bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col"
            style={{ 
              bottom: 'clamp(100px, 12vh, 140px)', // Responsive: well above control bar on all screen sizes
              maxHeight: 'min(400px, calc(100vh - 200px))' // Responsive max height
            }}
          >
            <div className="p-4 border-b flex items-center justify-between flex-shrink-0 bg-white">
              <h3 className="font-semibold text-gray-800">Reactions</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold leading-none w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
                aria-label="Close reactions"
              >
                ×
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1 bg-white">
              <div className="grid grid-cols-3 gap-3">
                {reactionEmojis.map((reaction) => (
                  <button
                    key={reaction.id}
                    onClick={() => sendReaction(reaction)}
                    className="p-4 hover:bg-gray-100 rounded-lg text-3xl transition-colors flex items-center justify-center aspect-square border border-gray-200 hover:border-gray-300 active:scale-95"
                    title={reaction.id}
                  >
                    {reaction.emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Floating Reactions - Google Meet style */}
      <div className="fixed inset-0 pointer-events-none z-[100]">
        {activeReactions.map((reaction, index) => {
          // Random horizontal position for variety
          const randomLeft = Math.random() * 70 + 15; // 15% to 85%
          // Random starting delay for staggered effect
          const randomDelay = Math.random() * 0.2;
          
          return (
            <div
              key={reaction.id}
              className="absolute text-3xl sm:text-4xl md:text-5xl lg:text-6xl reaction-float"
              style={{
                left: `${randomLeft}%`,
                bottom: '15%',
                animationDelay: `${randomDelay}s`,
                transform: 'translateY(0)',
              }}
            >
              {reaction.emoji}
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Reactions;