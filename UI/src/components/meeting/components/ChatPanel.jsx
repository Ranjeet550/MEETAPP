import React, { useRef, useEffect } from 'react';
import { FaComment, FaTimes } from 'react-icons/fa';

const ChatPanel = ({
  showChat = false,
  messages = [],
  newMessage = '',
  setNewMessage = () => {},
  onSendMessage = () => {},
  onClose = () => {},
  userId = '',
  userName = 'Guest User',
  participantNames = {}
}) => {
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, showChat]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage();
    }
  };

  return (
    <div
      className={`h-full bg-white shadow-2xl flex flex-col ${
        showChat ? 'w-full lg:w-80' : 'w-0'
      } transition-all duration-300`}
      style={{
        // ensure chat is above controls for small screens
        zIndex: 65,
      }}
    >
      {showChat && (
        <>
          {/* Chat Header */}
          <div className="px-4 lg:px-6 py-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Chat</h3>
              <button
                onClick={onClose}
                className="lg:hidden text-gray-400 hover:text-gray-600 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1">Messages are visible to everyone</p>
          </div>

          {/* Messages Area */}
          <div
            className="
              flex-1 
              px-4 lg:px-6 
              pt-4 pb-2 
              min-h-0 
              overflow-y-auto
              "
            // Add bottom padding on small screens so input isn't hidden
            style={{
              paddingBottom: '7rem', // Leaves room for fixed input on mobile/small screens
            }}
          >
            <div className="h-full flex flex-col">
              {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <FaComment className="w-6 h-6 lg:w-8 lg:h-8 text-gray-400" />
                  </div>
                  <h4 className="text-base lg:text-lg font-medium text-gray-900 mb-2">No messages yet</h4>
                  <p className="text-sm text-gray-500 max-w-xs">Start the conversation with your team members</p>
                </div>
              ) : (
                <div className="flex-1 space-y-3 lg:space-y-4 overflow-y-auto">
                  {messages.slice(-50).map((message) => (
                    <div key={message.id} className="flex space-x-2 lg:space-x-3">
                      <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0 text-sm">
                        {(message.userId === userId ? userName : (message.userName || participantNames[message.userId] || 'U')).charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline space-x-2 mb-1">
                          <span className="font-medium text-gray-900 text-sm lg:text-base truncate">
                            {message.userId === userId ? 'You' : (message.userName || participantNames[message.userId] || 'Unknown')}
                          </span>
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-gray-700 break-words leading-relaxed text-sm lg:text-base">{message.text}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </div>

          {/* Message Input */}
          {/* Mobile: fix to bottom, desktop: static */}
          <div
            className="
              px-4 lg:px-6 py-3 lg:py-4
              border-t border-gray-200 bg-white flex-shrink-0
              w-full
              fixed left-0 right-0 bottom-0
              lg:static lg:left-auto lg:right-auto lg:bottom-auto
              z-50
              lg:mb-0
            "
            style={{
              maxWidth: '100vw',
            }}
          >
            <div className="flex space-x-2 lg:space-x-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="
                  flex-1 
                  border border-gray-300 
                  rounded-lg lg:rounded-xl 
                  px-3 lg:px-4 
                  py-2 lg:py-3 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                  text-sm
                  "
                style={{
                  minWidth: 0, // prevents overflow on mobile
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="
                  bg-blue-500 hover:bg-blue-600 
                  disabled:bg-gray-300 disabled:cursor-not-allowed 
                  text-white 
                  px-4 lg:px-6
                  py-2 lg:py-3 
                  rounded-lg lg:rounded-xl 
                  font-medium 
                  transition-colors 
                  flex-shrink-0 
                  text-sm
                "
              >
                Send
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatPanel;