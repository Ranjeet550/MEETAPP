import { useState } from 'react';
import { FaCircle, FaStop, FaPause, FaPlay, FaSave } from 'react-icons/fa';

const RecordingControls = ({
  onStartRecording,
  onStopRecording,
  onPauseRecording,
  onResumeRecording,
  onSaveRecording,
  isRecording = false,
  isPaused = false,
  recordingDuration = 0,
  isSaving = false
}) => {
  const [showControls, setShowControls] = useState(false);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Responsive button sizing via Tailwind and breakpoints
  const buttonBase =
    "flex items-center justify-center rounded-xl transition-all duration-200 focus:outline-none";
  const buttonSize =
    "w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-12 md:h-12";
  const iconSize = "w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6";

  return (
    <>
      {/* Floating/Compact Recording Button. Responsive appearance. */}
      <button
        onClick={() => setShowControls(!showControls)}
        className={`
          ${buttonBase} ${buttonSize} shadow-md
          ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-700 hover:bg-gray-600 text-white'}
          fixed bottom-5 left-1/2 -translate-x-1/2 z-40
          sm:static sm:translate-x-0 sm:bottom-0 sm:left-0
        `}
        title={isRecording ? (isPaused ? 'Recording Paused' : 'Recording...') : 'Start recording'}
        aria-label={isRecording ? (isPaused ? 'Recording Paused' : 'Recording...') : 'Start recording'}
      >
        <FaCircle className={`${iconSize}`} />
      </button>

      {/* Modal positioned above control bar */}
      {showControls && (
       <>
         {/* Backdrop - Excludes bottom area where control bar is */}
         <div
           className="fixed left-0 right-0 top-0 bg-black bg-opacity-50 z-[9998]"
           style={{
             bottom: '120px' // Don't cover the control bar area (control bar is at bottom-3 + height ~80px)
           }}
           onClick={() => setShowControls(false)}
         />
          
         {/* Modal Panel - Positioned above control bar */}
         <div
           className="fixed left-1/2 transform -translate-x-1/2 z-[9999] w-11/12 max-w-sm bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col"
           style={{
             bottom: 'clamp(100px, 12vh, 140px)', // Responsive: well above control bar on all screen sizes
             maxHeight: 'min(400px, calc(100vh - 200px))' // Responsive max height
           }}
         >
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-base xs:text-lg">
                Recording
              </h3>
              <button
                onClick={() => setShowControls(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl px-1"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="p-4">

              {/* Duration + status */}
              {(isRecording || isPaused) && (
                <div className="mb-4 text-center">
                  <div className="text-2xl xs:text-3xl font-mono text-red-600 mb-1">
                    {formatDuration(recordingDuration)}
                  </div>
                  <div className="text-sm xs:text-base text-gray-500 dark:text-gray-300">
                    {isPaused ? 'Paused' : 'Recording...'}
                  </div>
                  {/* Save indicator */}
                  {isSaving && (
                    <div className="text-xs text-orange-400 mt-1 animate-pulse">Saving...</div>
                  )}
                </div>
              )}

              <div className="
                flex flex-col xs:flex-row items-center justify-center gap-3
              ">
                {/* Not recording: show start */}
                {!isRecording && !isPaused && (
                  <button
                    onClick={() => {
                      onStartRecording?.();
                      setShowControls(false);
                    }}
                    className="
                      flex items-center justify-center space-x-2
                      bg-red-500 hover:bg-red-600 text-white
                      px-6 py-2 rounded-lg font-medium text-base xs:text-lg
                      w-full xs:w-auto
                    "
                  >
                    <FaCircle />
                    <span>Start Recording</span>
                  </button>
                )}

                {/* If recording or paused */}
                {(isRecording || isPaused) && (
                  <>
                    {/* Pause or Resume */}
                    {isPaused ? (
                      <button
                        onClick={onResumeRecording}
                        className="
                          flex items-center justify-center
                          bg-green-500 hover:bg-green-600 text-white rounded-lg
                          px-4 py-2 xs:px-5 xs:py-3 text-base xs:text-lg
                        "
                        title="Resume recording"
                      >
                        <FaPlay className="mr-2" /> <span>Resume</span>
                      </button>
                    ) : (
                      <button
                        onClick={onPauseRecording}
                        className="
                          flex items-center justify-center
                          bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg
                          px-4 py-2 xs:px-5 xs:py-3 text-base xs:text-lg
                        "
                        title="Pause recording"
                      >
                        <FaPause className="mr-2" /> <span>Pause</span>
                      </button>
                    )}

                    {/* Save current recording */}
                    <button
                      onClick={onSaveRecording}
                      disabled={isSaving}
                      className={`
                        flex items-center justify-center
                        bg-blue-500 hover:bg-blue-600 disabled:opacity-50
                        text-white rounded-lg
                        px-4 py-2 xs:px-5 xs:py-3 text-base xs:text-lg font-semibold
                        transition-all
                        ${isSaving ? 'cursor-wait' : ''}
                      `}
                      title="Save current recording so far"
                    >
                      <FaSave className="mr-2" /> <span>Save</span>
                    </button>

                    {/* Stop recording */}
                    <button
                      onClick={() => {
                        onStopRecording?.();
                        setShowControls(false);
                      }}
                      className="
                        flex items-center justify-center
                        bg-red-500 hover:bg-red-600 text-white rounded-lg
                        px-4 py-2 xs:px-5 xs:py-3 text-base xs:text-lg
                      "
                      title="Stop recording"
                    >
                      <FaStop className="mr-2" /> <span>Stop</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default RecordingControls;