import React from 'react';
import MeetingHeader from './MeetingHeader';
import VideoGrid from './VideoGrid';
import ChatPanel from './ChatPanel';
import MeetingControls from './MeetingControls';
import FeatureControls from './FeatureControls';
import FloatingReactions from './FloatingReactions';


const MeetingLayout = ({
  meetingId,
  participants,
  userName,
  showChat,
  onToggleChat,
  reactions,
  children,
  ...props
}) => {
  return (
    <div className="min-h-screen h-full bg-gray-900 flex flex-col overflow-hidden">
      {/* Header - Responsive */}
      <div className="flex-shrink-0 w-full">
        <MeetingHeader
          meetingId={meetingId}
          participants={participants}
          userName={userName}
        />
      </div>

      {/* Main Content - Responsive grid for wide + stacked for mobile */}
      <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden w-full">
        {/* Video Area */}
        <div
          className={`
            flex-1 relative transition-all duration-300
            w-full
            ${showChat ? 'lg:mr-80' : ''}
            flex flex-col
          `}
        >
          <div className="flex-1 flex flex-col">
            <VideoGrid
              participants={participants}
              userName={userName}
              {...props}
            />

            {/* Floating Reactions - z-40 goes above control area */}
            {reactions && reactions.length > 0 && (
              <FloatingReactions reactions={reactions} />
            )}
          </div>

          {/* Meeting Controls - floating on mobile, fixed in grid area for desktop */}
          <div className="fixed bottom-3 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-2
                          xs:max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-4xl
                          lg:absolute lg:bottom-4 lg:left-1/2 lg:-translate-x-1/2 pointer-events-none lg:pointer-events-auto
                          lg:mb-0 md:bottom-4">
            <div className="pointer-events-auto bg-gray-800/90 backdrop-blur-lg rounded-xl lg:rounded-2xl px-2 xs:px-4 lg:px-6 py-2 xs:py-3 lg:py-4 shadow-2xl border border-gray-700 transition-all">
              <div className="flex flex-wrap items-center justify-center space-x-2 lg:space-x-4">
                {/* Primary Controls */}
                <MeetingControls
                  {...props}
                  showChat={showChat}
                  onToggleChat={onToggleChat}
                />

                {/* Divider - Hidden on mobile */}
                <div className="hidden sm:block w-px h-6 lg:h-8 bg-gray-600"></div>

                {/* Feature Controls */}
                <FeatureControls {...props} />
              </div>
            </div>
          </div>

          
        </div>

        {/* Chat Panel - Responsive slide-in/out, overlays on mobile, side on desktop */}
        <div className={`
          fixed lg:static top-0 right-0 h-full bg-white dark:bg-gray-950
          flex-shrink-0
          transition-all duration-300 z-55
          ${showChat
            ? 'w-full min-[375px]:w-11/12 xs:w-4/5 sm:w-1/2 md:w-5/12 lg:w-80 translate-x-0'
            : 'w-0 translate-x-full lg:w-80 lg:translate-x-0 lg:static'}
          overflow-hidden border-l border-gray-200 dark:border-gray-800
          lg:mb-0
        `}>
          {/* Only render ChatPanel if needed (prevents mounting unless shown) */}
          {showChat && (
            <div className="h-full w-full flex flex-col">
              <ChatPanel
                showChat={showChat}
                userName={userName}
                onClose={onToggleChat}
                {...props}
              />
            </div>
          )}
        </div>
      </div>

      {/* Additional Components */}
      {children}
    </div>
  );
};

export default MeetingLayout;