import React, { useState, useEffect, useRef } from 'react';
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaDesktop,
  FaPhone,
  FaComment
} from 'react-icons/fa';

const ICON_SIZE_CLASSES = "w-5 h-5";
const ICON_SIZE_MOBILE = "w-4 h-4";
const ICON_SIZE_TABLET = "w-5 h-5";
const BUTTON_BASE_CLASSES =
  "flex items-center justify-center rounded-xl transition-all duration-200 focus:outline-none";
const BUTTON_SIZE_CLASSES = "w-10 h-10 xs:w-11 xs:h-11 sm:w-12 sm:h-12 md:w-14 md:h-14"; // enhanced responsive width/height

const MeetingControls = ({
  isMuted = false,
  isVideoOn = true,
  isScreenSharing = false,
  joinWithoutMedia = false,
  showChat = false,
  onToggleMute = () => {},
  onToggleVideo = () => {},
  onToggleScreenShare = () => {},
  onLeaveMeeting = () => {},
  onToggleChat = () => {}
}) => {
  const [activePanel, setActivePanel] = useState(null);
  const controlsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (controlsRef.current && !controlsRef.current.contains(event.target)) {
        setActivePanel(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handlePanelToggle = (panelName) => {
    setActivePanel(activePanel === panelName ? null : panelName);
  };
  return (
    <div className="flex items-center justify-center flex-wrap gap-y-2 gap-x-1 xs:gap-x-2 sm:gap-x-3 md:gap-x-4 lg:gap-x-6">
      {/* Primary Controls */}
      <div className="flex items-center gap-x-1 xs:gap-x-2 sm:gap-x-3 lg:gap-x-4">
        {/* Mute/Unmute */}
        <button
          onClick={() => { onToggleMute(); handlePanelToggle('mute'); }}
          disabled={joinWithoutMedia}
          className={`
            ${BUTTON_BASE_CLASSES} ${BUTTON_SIZE_CLASSES}
            ${isMuted || joinWithoutMedia
              ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
              : 'bg-gray-700 hover:bg-gray-600 text-white'
            }
            ${joinWithoutMedia ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted || joinWithoutMedia ? (
            <FaMicrophoneSlash className={`${ICON_SIZE_MOBILE} xs:${ICON_SIZE_MOBILE} sm:${ICON_SIZE_TABLET}`} />
          ) : (
            <FaMicrophone className={`${ICON_SIZE_MOBILE} xs:${ICON_SIZE_MOBILE} sm:${ICON_SIZE_TABLET} lg:${ICON_SIZE_CLASSES}`} />
          )}
        </button>
        {/* Video On/Off */}
        <button
          onClick={() => { onToggleVideo(); handlePanelToggle('video'); }}
          disabled={joinWithoutMedia}
          className={`
            ${BUTTON_BASE_CLASSES} ${BUTTON_SIZE_CLASSES}
            ${!isVideoOn || joinWithoutMedia
              ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
              : 'bg-gray-700 hover:bg-gray-600 text-white'
            }
            ${joinWithoutMedia ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
        >
          {isVideoOn && !joinWithoutMedia ? (
            <FaVideo className={`${ICON_SIZE_MOBILE} xs:${ICON_SIZE_MOBILE} sm:${ICON_SIZE_TABLET}`} />
          ) : (
            <FaVideoSlash className={`${ICON_SIZE_MOBILE} xs:${ICON_SIZE_MOBILE} sm:${ICON_SIZE_TABLET}`} />
          )}
        </button>
        {/* Screen Share */}
        <button
          onClick={() => { onToggleScreenShare(); handlePanelToggle('screenShare'); }}
          className={`
            ${BUTTON_BASE_CLASSES} ${BUTTON_SIZE_CLASSES}
            ${isScreenSharing
              ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg'
              : 'bg-gray-700 hover:bg-gray-600 text-white'
            }
            cursor-pointer
          `}
          title={isScreenSharing ? 'Stop presenting' : 'Present'}
        >
          <FaDesktop className={`${ICON_SIZE_MOBILE} xs:${ICON_SIZE_MOBILE} sm:${ICON_SIZE_TABLET} lg:${ICON_SIZE_CLASSES}`} />
        </button>
      </div>

      {/* Divider (hide divider on very small screens for better stacking) */}
      <div className="hidden xs:block w-px h-8 bg-gray-600"></div>

      {/* Chat Button */}
      <button
        onClick={() => { onToggleChat(); handlePanelToggle('chat'); }}
        className={`
          ${BUTTON_BASE_CLASSES} ${BUTTON_SIZE_CLASSES}
          ${showChat
            ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg'
            : 'bg-gray-700 hover:bg-gray-600 text-white'
          }
          cursor-pointer
        `}
        title={showChat ? 'Close chat' : 'Open chat'}
      >
        <FaComment className={`${ICON_SIZE_MOBILE} xs:${ICON_SIZE_MOBILE} sm:${ICON_SIZE_TABLET} lg:${ICON_SIZE_CLASSES}`} />
      </button>

      {/* Leave Button */}
      <button
        onClick={onLeaveMeeting}
        className={`
          ${BUTTON_BASE_CLASSES} ${BUTTON_SIZE_CLASSES}
          bg-red-700 hover:bg-red-600 text-white shadow-lg
          cursor-pointer
        `}
        title="Leave call"
      >
        <FaPhone className={`${ICON_SIZE_MOBILE} xs:${ICON_SIZE_MOBILE} sm:${ICON_SIZE_TABLET} lg:${ICON_SIZE_CLASSES} transform rotate-[220deg]`} />
      </button>
    </div>
  );
};

export default MeetingControls;