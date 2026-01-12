import React from 'react';
import { FaVideo, FaClock, FaUsers } from 'react-icons/fa';

const MeetingHeader = ({ meetingId = '', participants = [], userName = 'Guest User' }) => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <FaVideo className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Meeting Room</h1>
            <div className="text-sm text-gray-500 flex items-center space-x-2">
              <FaClock className="w-4 h-4" />
              <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              <span>ID: {meetingId || 'Loading...'}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-gray-50 rounded-full px-4 py-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <FaUsers className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">{(participants?.length || 0) + 1}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingHeader;