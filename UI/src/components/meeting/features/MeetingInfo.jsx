import { useState } from 'react';
import { FaInfoCircle, FaCopy, FaCheck, FaCalendar, FaClock, FaUsers, FaLink } from 'react-icons/fa';

const MeetingInfo = ({ 
  meetingId,
  meetingTitle = '',
  startTime,
  duration,
  participantCount,
  meetingLink,
  hostName = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <>
      {/* Simple Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-12 rounded-xl bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center transition-all duration-200"
        title="Meeting info"
      >
        <FaInfoCircle className="w-4 h-4 mr-2" />
        <span className="text-sm font-medium">Meeting Info</span>
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
            {/* Header */}
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Meeting Information</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Meeting Title */}
              {meetingTitle && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Title</label>
                  <div className="text-sm text-gray-900 mt-1">{meetingTitle}</div>
                </div>
              )}

              {/* Meeting ID */}
              <div>
                <label className="text-sm font-medium text-gray-700">Meeting ID</label>
                <div className="flex items-center space-x-2 mt-1">
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono flex-1">
                    {meetingId}
                  </code>
                  <button
                    onClick={() => copyToClipboard(meetingId)}
                    className="p-1 hover:bg-gray-100 rounded text-gray-600"
                    title="Copy meeting ID"
                  >
                    {copied ? <FaCheck className="text-green-500" /> : <FaCopy />}
                  </button>
                </div>
              </div>

              {/* Meeting Link */}
              {meetingLink && (
                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <FaLink className="mr-1" />
                    Meeting Link
                  </label>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="text-sm text-blue-600 truncate flex-1">
                      {meetingLink}
                    </div>
                    <button
                      onClick={() => copyToClipboard(meetingLink)}
                      className="p-1 hover:bg-gray-100 rounded text-gray-600"
                      title="Copy meeting link"
                    >
                      {copied ? <FaCheck className="text-green-500" /> : <FaCopy />}
                    </button>
                  </div>
                </div>
              )}

              {/* Host */}
              {hostName && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Host</label>
                  <div className="text-sm text-gray-900 mt-1">{hostName}</div>
                </div>
              )}

              {/* Duration */}
              {duration && (
                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <FaClock className="mr-1" />
                    Duration
                  </label>
                  <div className="text-sm text-gray-900 mt-1">
                    {formatDuration(duration)}
                  </div>
                </div>
              )}

              {/* Participant Count */}
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <FaUsers className="mr-1" />
                  Participants
                </label>
                <div className="text-sm text-gray-900 mt-1">
                  {participantCount} {participantCount === 1 ? 'person' : 'people'}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default MeetingInfo;