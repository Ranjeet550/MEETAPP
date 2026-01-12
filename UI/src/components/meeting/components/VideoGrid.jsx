import React, { useState, useRef } from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaDesktop, FaUser, FaExpand, FaCompress } from 'react-icons/fa';

const VideoGrid = ({
  localVideoRef,
  participants = [],
  remoteStreams = {},
  participantNames = {},
  userId,
  userName = 'Guest User',
  isMuted = false,
  joinWithoutMedia = false,
  audioLevel = 0,
  isScreenSharing = false,
  currentBackground = null
}) => {
  const [expandedTile, setExpandedTile] = useState(null); // null, 'local', or participant id
  const localTileRef = useRef(null);
  const remoteTileRefs = useRef({});

  // Handles full screen using browser API for the given ref
  const handleExpand = (tileType, participantId = null) => {
    let node = null;
    if (tileType === 'local') {
      node = localTileRef.current;
      setExpandedTile('local');
    } else if (tileType === 'remote' && participantId) {
      node = remoteTileRefs.current[participantId];
      setExpandedTile(participantId);
    }
    if (node && node.requestFullscreen) {
      node.requestFullscreen();
    }
  };

  const handleCollapse = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    setExpandedTile(null);
  };

  // Listen for exit full screen to update state as necessary
  React.useEffect(() => {
    const handleFSChange = () => {
      if (!document.fullscreenElement) setExpandedTile(null);
    };
    document.addEventListener('fullscreenchange', handleFSChange);
    return () => document.removeEventListener('fullscreenchange', handleFSChange);
  }, []);

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      <div className="h-full">
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 h-full auto-rows-fr ${
            expandedTile ? 'pointer-events-none' : ''
          }`}
        >
          {/* Local Video Tile */}
          <div
            ref={localTileRef}
            className={`relative bg-gray-900 rounded-2xl overflow-hidden shadow-xl border border-gray-700 aspect-video transition-all ${
              expandedTile === 'local' ? 'z-50' : ''
            }`}
            style={
              expandedTile === 'local'
                ? {
                    position: 'fixed',
                    inset: 0,
                    width: '100vw',
                    height: '100vh',
                    aspectRatio: 'unset',
                  }
                : {}
            }
          >
            {!joinWithoutMedia ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={expandedTile === 'local' ? { height: '100%', width: '100%' } : {}}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg">
                  {userName ? userName.charAt(0).toUpperCase() : 'G'}
                </div>
                <h3 className="text-white text-lg font-medium mb-2">{userName || 'Guest User'} (You)</h3>
                <p className="text-gray-400 text-sm mb-4">Camera and microphone disabled</p>
                <button
                  onClick={() => window.enableMedia && window.enableMedia()}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Enable Camera & Mic
                </button>
              </div>
            )}

            {/* Fullscreen Button */}
            <button
              className="absolute top-4 left-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg focus:outline-none z-20"
              onClick={
                expandedTile === 'local'
                  ? handleCollapse
                  : () => handleExpand('local')
              }
              style={{ pointerEvents: 'auto' }}
              title={expandedTile === 'local' ? 'Collapse' : 'Expand to full screen'}
            >
              {expandedTile === 'local' ? (
                <FaCompress className="w-4 h-4" />
              ) : (
                <FaExpand className="w-4 h-4" />
              )}
            </button>

            {/* User Info Badge */}
            <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm text-white px-3 py-2 rounded-lg flex items-center space-x-2">
              <span className="font-medium">{userName || 'Guest User'} (You)</span>
              {isMuted || joinWithoutMedia ? (
                <FaMicrophoneSlash className="w-4 h-4 text-red-400" />
              ) : (
                <FaMicrophone className="w-4 h-4 text-green-400" />
              )}
              {!isMuted && !joinWithoutMedia && audioLevel > 10 && (
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              )}
            </div>

            {/* Status Indicators */}
            <div className="absolute top-4 right-4 flex space-x-2">
              {isScreenSharing && (
                <div className="bg-blue-500 text-white px-3 py-1 rounded-lg text-xs font-medium flex items-center space-x-1">
                  <FaDesktop className="w-3 h-3" />
                  <span>Presenting</span>
                </div>
              )}
              {currentBackground && (
                <div className="bg-purple-500 text-white px-3 py-1 rounded-lg text-xs font-medium">
                  Background
                </div>
              )}
            </div>
          </div>

          {/* Remote Video Tiles */}
          {participants.filter(p => p !== userId).map((participant, index) => {
            const stream = remoteStreams[participant];
            const participantName = participantNames[participant] || `User ${index + 1}`;
            return (
              <div
                key={participant}
                ref={el => {
                  if (el) remoteTileRefs.current[participant] = el;
                }}
                className={`relative bg-gray-800 rounded-2xl overflow-hidden shadow-xl border border-gray-700 aspect-video transition-all ${
                  expandedTile === participant ? 'z-50' : ''
                }`}
                style={
                  expandedTile === participant
                    ? {
                        position: 'fixed',
                        inset: 0,
                        width: '100vw',
                        height: '100vh',
                        aspectRatio: 'unset',
                      }
                    : {}
                }
              >
                {stream ? (
                  <video
                    autoPlay
                    playsInline
                    muted={false}
                    ref={el => {
                      if (el && stream && el.srcObject !== stream) {
                        el.srcObject = stream;
                        el.play().catch(console.error);
                      }
                    }}
                    className="w-full h-full object-cover"
                    style={expandedTile === participant ? { height: '100%', width: '100%' } : {}}
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                    <div className="w-20 h-20 bg-gray-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg">
                      {participantName ? participantName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <h3 className="text-white text-lg font-medium mb-2">{participantName}</h3>
                    <p className="text-gray-400 text-sm">Connecting...</p>
                  </div>
                )}

                {/* Fullscreen Button */}
                <button
                  className="absolute top-4 left-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg focus:outline-none z-20"
                  onClick={
                    expandedTile === participant
                      ? handleCollapse
                      : () => handleExpand('remote', participant)
                  }
                  style={{ pointerEvents: 'auto' }}
                  title={expandedTile === participant ? 'Collapse' : 'Expand to full screen'}
                >
                  {expandedTile === participant ? (
                    <FaCompress className="w-4 h-4" />
                  ) : (
                    <FaExpand className="w-4 h-4" />
                  )}
                </button>

                {/* Participant Info Badge */}
                <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm text-white px-3 py-2 rounded-lg flex items-center space-x-2">
                  <span className="font-medium">{participantName}</span>
                  <FaMicrophone className="w-4 h-4 text-green-400" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VideoGrid;