import React from 'react';
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaDesktop,
  FaPhone,
  FaCircle,
  FaImage,
  FaUsers,
  FaPencilAlt,
  FaSmile,
  FaPoll,
  FaCog,
  FaInfoCircle,
} from 'react-icons/fa';

/**
 * Responsive ControlBar for meetings (properly adapts to all breakpoints)
 */
const ICON_SIZES = "w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6";
const BUTTON_BASE =
  "flex items-center justify-center rounded-xl transition-all duration-200 focus:outline-none";
const BUTTON_SIZES =
  "w-10 h-10 xs:w-11 xs:h-11 sm:w-12 sm:h-12"; // Responsive width/height
const SMALL_BUTTON_SIZES =
  "w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10"; // For secondary controls

const ControlBar = ({
  isMuted,
  isVideoOn,
  isScreenSharing,
  joinWithoutMedia,
  isRecording,
  currentBackground,
  breakoutRooms,
  isHost,
  toggleMute,
  toggleVideo,
  toggleScreenShare,
  leaveMeeting,
  showRecording,
  setShowRecording,
  showBackgrounds,
  setShowBackgrounds,
  showParticipants,
  setShowParticipants,
  showReactions,
  setShowReactions,
  showPolls,
  setShowPolls,
  showBreakout,
  setShowBreakout,
  showSettings,
  setShowSettings,
  showMeetingInfo,
  setShowMeetingInfo,
  setShowWhiteboard,
}) => {
  return (
    <div
      className="
        fixed
        left-0 right-0
        bottom-0
        px-2 pb-2
        z-40
        flex justify-center
        pointer-events-none
        sm:static sm:bottom-8 sm:left-1/2 sm:transform sm:-translate-x-1/2
        sm:pointer-events-auto
      "
      style={{width: '100vw'}}
    >
      <div
        className="
          bg-gray-800/90 backdrop-blur-lg
          rounded-xl xs:rounded-2xl
          px-2 xs:px-4 sm:px-6
          py-2 xs:py-3 sm:py-4
          shadow-2xl border border-gray-700
          max-w-full
          flex-1
          pointer-events-auto
          flex justify-center
        "
        style={{maxWidth: 568}}
      >
        <div
          className="
            flex flex-wrap items-center
            gap-x-1 xs:gap-x-2 sm:gap-x-4 gap-y-2 justify-center
            w-full
          "
        >

          {/* Primary Controls */}
          <div className="flex items-center gap-x-1 xs:gap-x-2 sm:gap-x-3">
            {/* Mute/Unmute */}
            <button
              onClick={toggleMute}
              disabled={joinWithoutMedia}
              className={`
                ${BUTTON_BASE} ${BUTTON_SIZES}
                ${isMuted || joinWithoutMedia
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
                }
                ${joinWithoutMedia ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || joinWithoutMedia ? (
                <FaMicrophoneSlash className={ICON_SIZES} />
              ) : (
                <FaMicrophone className={ICON_SIZES} />
              )}
            </button>

            {/* Video On/Off */}
            <button
              onClick={toggleVideo}
              disabled={joinWithoutMedia}
              className={`
                ${BUTTON_BASE} ${BUTTON_SIZES}
                ${!isVideoOn || joinWithoutMedia
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
                }
                ${joinWithoutMedia ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
            >
              {isVideoOn && !joinWithoutMedia ? (
                <FaVideo className={ICON_SIZES} />
              ) : (
                <FaVideoSlash className={ICON_SIZES} />
              )}
            </button>

            {/* Screen Share */}
            <button
              onClick={toggleScreenShare}
              className={`
                ${BUTTON_BASE} ${BUTTON_SIZES}
                ${isScreenSharing
                  ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
                }
              `}
              title={isScreenSharing ? 'Stop presenting' : 'Present'}
            >
              <FaDesktop className={ICON_SIZES} />
            </button>
          </div>

          {/* Divider - Hide on mobile */}
          <div className="hidden xs:block w-px h-8 bg-gray-600" />

          {/* Secondary Controls */}
          <div className="flex items-center gap-x-1 xs:gap-x-2 sm:gap-x-2">
            {/* Recording */}
            <div className="relative">
              <button
                onClick={() => setShowRecording(!showRecording)}
                className={`
                  ${BUTTON_BASE} ${SMALL_BUTTON_SIZES}
                  feature-button
                  ${isRecording
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }
                `}
                title="Recording"
              >
                <FaCircle className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Background Effects */}
            <div className="relative">
              <button
                onClick={() => setShowBackgrounds(!showBackgrounds)}
                className={`
                  ${BUTTON_BASE} ${SMALL_BUTTON_SIZES}
                  feature-button
                  ${currentBackground
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }
                `}
                title="Background effects"
              >
                <FaImage className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Participants */}
            <div className="relative">
              <button
                onClick={() => setShowParticipants(!showParticipants)}
                className={`
                  ${BUTTON_BASE} ${SMALL_BUTTON_SIZES}
                  bg-gray-700 hover:bg-gray-600 text-white feature-button
                `}
                title="Participants"
              >
                <FaUsers className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Whiteboard */}
            <button
              onClick={() => setShowWhiteboard(true)}
              className={`
                ${BUTTON_BASE} ${SMALL_BUTTON_SIZES}
                bg-gray-700 hover:bg-gray-600 text-white feature-button
              `}
              title="Whiteboard"
            >
              <FaPencilAlt className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Reactions */}
            <div className="relative">
              <button
                onClick={() => setShowReactions(!showReactions)}
                className={`
                  ${BUTTON_BASE} ${SMALL_BUTTON_SIZES}
                  bg-gray-700 hover:bg-gray-600 text-white feature-button
                `}
                title="Reactions"
              >
                <FaSmile className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Polls */}
            <div className="relative">
              <button
                onClick={() => setShowPolls(!showPolls)}
                className={`
                  ${BUTTON_BASE} ${SMALL_BUTTON_SIZES}
                  bg-gray-700 hover:bg-gray-600 text-white feature-button
                `}
                title="Polls"
              >
                <FaPoll className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Breakout Rooms - Host only */}
            {isHost && (
              <div className="relative">
                <button
                  onClick={() => setShowBreakout(!showBreakout)}
                  className={`
                    ${BUTTON_BASE} ${SMALL_BUTTON_SIZES}
                    feature-button
                    ${breakoutRooms.length > 0
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                    }
                  `}
                  title="Breakout rooms"
                >
                  <FaUsers className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            )}

            {/* Settings */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`
                  ${BUTTON_BASE} ${SMALL_BUTTON_SIZES}
                  bg-gray-700 hover:bg-gray-600 text-white feature-button
                `}
                title="Settings"
              >
                <FaCog className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Meeting Info */}
            <div className="relative">
              <button
                onClick={() => setShowMeetingInfo(!showMeetingInfo)}
                className={`
                  ${BUTTON_BASE} ${SMALL_BUTTON_SIZES}
                  bg-gray-700 hover:bg-gray-600 text-white feature-button
                `}
                title="Meeting info"
              >
                <FaInfoCircle className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Divider - Hide on mobile */}
          <div className="hidden xs:block w-px h-8 bg-gray-600" />

          {/* Leave Button */}
          <button
            onClick={leaveMeeting}
            className={`
              ${BUTTON_BASE} ${BUTTON_SIZES}
              bg-red-500 hover:bg-red-600 text-white shadow-lg
            `}
            title="Leave call"
          >
            <FaPhone className={ICON_SIZES} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControlBar;