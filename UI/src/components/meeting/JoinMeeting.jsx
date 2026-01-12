import React, { useState } from 'react';
import { joinMeeting } from '../../services/apiService';
import { FaVideo, FaArrowRight, FaLink, FaUserPlus, FaDoorOpen } from 'react-icons/fa';

const JoinMeeting = () => {
  const [meetingId, setMeetingId] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  
  const handleJoinMeeting = async () => {
    try {
      setIsJoining(true);
      setError('');
      
      // Extract just the meeting ID if it contains URL parameters
      const cleanMeetingId = meetingId.split('?meetingId=').pop() || meetingId;
      
      if (!cleanMeetingId) {
        setError('Please enter a meeting ID');
        return;
      }
      
      // Allow guest users - no authentication required
      // If user is logged in, use their userId; otherwise let backend generate guest ID
      const userId = localStorage.getItem('userId') || localStorage.getItem('guestUserId') || '';
      
      const data = await joinMeeting(cleanMeetingId, userId);
      if (data && data.meeting) {
        console.log('Joined meeting:', data.meeting);
        // Store the userId (guest or authenticated) for future requests
        if (data.userId) {
          localStorage.setItem('guestUserId', data.userId);
        }
        
        // Redirect to the meeting room
        window.location.href = `/meeting/${cleanMeetingId}`;
      } else if (data && data.message) {
        console.error('Error joining meeting:', data.message);
        setError(data.message);
      } else {
        console.error('Unexpected response:', data);
        setError('An unexpected error occurred');
      }
    } catch (error) {
      console.error('Error joining meeting:', error);
      setError('Failed to join meeting. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Remove scrollbar */}
      <style>
        {`
          body {
            overflow-y: hidden;
          }
        `}
      </style>
      
      {/* Modern Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mr-3 shadow-lg">
            <FaDoorOpen className="text-white text-xl" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Join Meeting
          </h1>
        </div>
        
        <p className="text-lg text-white/80 max-w-2xl mx-auto">
          Enter the meeting ID to join an existing meeting
        </p>
      </div>
      
      {/* Main Content */}
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
          {/* Animated Door Illustration */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-t-full flex items-center justify-center shadow-lg">
                <FaDoorOpen className="text-white text-2xl" />
              </div>
              <div className="w-16 h-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-b-lg"></div>
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-center text-white mb-2">
            Enter Meeting ID
          </h2>
          <p className="text-center text-white/80 mb-4 text-sm">
            Paste the meeting ID you received
          </p>
          
          {/* Input Field */}
          <div className="mb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLink className="text-cyan-400" />
              </div>
            <input
              type="text"
              placeholder="Enter meeting ID..."
              value={meetingId}
              onChange={(e) => setMeetingId(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-white/30 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all bg-white/20 text-white"
            />
            </div>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-sm text-red-400 flex items-center">
              <span className="mr-2">⚠️</span>
              <span>{error}</span>
            </div>
          )}
          
          {/* Standard Size Join Button */}
          <button
            onClick={handleJoinMeeting}
            disabled={isJoining || !meetingId}
            className={`w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold py-3 px-4 rounded-lg text-base shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center ${(isJoining || !meetingId) ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {isJoining ? (
              <>
                <span className="animate-spin mr-2">🌀</span>
                Joining...
              </>
            ) : (
              <>
                <FaArrowRight className="mr-2" />
                Join Meeting
              </>
            )}
          </button>
          
          {/* Quick Tips */}
          <div className="mt-6 pt-3 border-t border-white/20">
            <h3 className="text-xs font-medium text-white/80 mb-1">HOW TO JOIN:</h3>
            <ul className="text-xs text-white/80 space-y-1">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Get the meeting ID from the organizer</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Paste it in the input field above</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Click "Join Meeting" to enter</span>
              </li>
            </ul>
          </div>
          
          {/* Alternative Actions */}
          <div className="mt-4 text-center">
            <p className="text-xs text-white/60 mb-2">Don't have a meeting ID?</p>
            <button
              onClick={() => window.location.href = '/create-meeting'}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center justify-center mx-auto cursor-pointer"
            >
              <FaUserPlus className="mr-1" />
              Create a new meeting instead
            </button>
          </div>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-3 h-3 bg-blue-200 rounded-full opacity-50 animate-pulse"></div>
      <div className="absolute top-20 right-20 w-4 h-4 bg-emerald-200 rounded-full opacity-50 animate-pulse" style={{animationDelay: '0.5s'}}></div>
      <div className="absolute bottom-20 left-20 w-2 h-2 bg-cyan-200 rounded-full opacity-50 animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-10 right-10 w-3 h-3 bg-purple-200 rounded-full opacity-50 animate-pulse" style={{animationDelay: '1.5s'}}></div>
    </div>
  );
};

export default JoinMeeting;