import React, { useState } from 'react';
import { createMeeting } from '../../services/apiService';
import { FaVideo, FaCopy, FaCheck, FaArrowRight, FaUsers, FaLink, FaRocket } from 'react-icons/fa';

const CreateMeeting = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [createdMeetingId, setCreatedMeetingId] = useState('');
  const [copied, setCopied] = useState(false);
  
  const generateRandomMeetingId = () => {
    // Generate a random 8-character alphanumeric meeting ID
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };
  
  const handleCreateMeeting = async () => {
    try {
      setIsCreating(true);
      
      // Generate random meeting ID automatically
      const randomMeetingId = generateRandomMeetingId();
      
      // Allow guest users - no authentication required
      // If user is logged in, use their userId; otherwise let backend generate guest ID
      const userId = localStorage.getItem('userId') || ''; // Empty string for guest users
      
      const data = await createMeeting(randomMeetingId, userId);
      
      if (data && data.meeting) {
        console.log('Meeting created:', data.meeting);
        // Store the userId (guest or authenticated) for future requests
        if (data.userId) {
          localStorage.setItem('guestUserId', data.userId);
        }
        
        // Set the created meeting ID to show the success screen
        setCreatedMeetingId(randomMeetingId);
        
        // Copy to clipboard automatically
        const meetingLink = `${window.location.origin}/join-meeting?meetingId=${randomMeetingId}`;
        navigator.clipboard.writeText(meetingLink);
        setCopied(true);
        
        // Reset copied state after 3 seconds
        setTimeout(() => setCopied(false), 3000);
        
      } else if (data && data.message) {
        console.error('Error creating meeting:', data.message);
        alert(`Error: ${data.message}`);
      } else {
        console.error('Unexpected response:', data);
        alert('An unexpected error occurred');
      }
    } catch (error) {
      console.error('Error creating meeting:', error);
      alert('Failed to create meeting. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 flex flex-col items-center justify-center p-4 overflow-hidden">
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
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-full flex items-center justify-center mr-3 shadow-lg">
            <FaVideo className="text-white text-xl" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-700 to-emerald-700 bg-clip-text text-transparent">
            Create Instant Meeting
          </h1>
        </div>
        
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Start a professional video meeting in seconds. No login required!
        </p>
      </div>
      
      {/* Main Content */}
      <div className="w-full max-w-md">
        {!createdMeetingId ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-blue-100">
            {/* Animated Rocket Illustration - Smaller */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-emerald-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <FaRocket className="text-white text-2xl transform rotate-45" />
                </div>
                {/* Smoke effect - Smaller */}
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-white/60 rounded-full opacity-80 animate-pulse"></div>
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-center text-gray-800 mb-2">
              Ready to connect?
            </h2>
            <p className="text-center text-gray-600 mb-6 text-sm">
              Click the button below to instantly create a meeting
            </p>
            
            {/* Standard Size Create Button */}
            <button
              onClick={handleCreateMeeting}
              disabled={isCreating}
              className={`w-full bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-bold py-3 px-4 rounded-lg text-base shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center ${isCreating ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {isCreating ? (
                <>
                  <span className="animate-spin mr-2">🌀</span>
                  Creating...
                </>
              ) : (
                <>
                  <FaVideo className="mr-2" />
                  Create Instant Meeting
                </>
              )}
            </button>
            
            {/* Features List - Compact */}
            <div className="mt-6 space-y-2">
              {[
                { icon: <FaUsers className="text-blue-600" />, text: 'Unlimited participants' },
                { icon: <FaLink className="text-emerald-600" />, text: 'Instant shareable link' },
                { icon: <FaVideo className="text-cyan-600" />, text: 'HD video quality' },
                { icon: <FaCopy className="text-purple-600" />, text: 'Auto-copy to clipboard' }
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-blue-100">
            {/* Success Animation - Smaller */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <FaCheck className="text-white text-2xl" />
                </div>
                {/* Confetti effect - Smaller */}
                <div className="absolute -top-2 -left-2 w-3 h-3 bg-yellow-400 rounded-full opacity-80 animate-bounce" style={{animationDelay: '0s'}}></div>
                <div className="absolute -top-2 -right-2 w-3 h-3 bg-blue-400 rounded-full opacity-80 animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-pink-400 rounded-full opacity-80 animate-bounce" style={{animationDelay: '0.4s'}}></div>
                <div className="absolute -bottom-2 -right-2 w-3 h-3 bg-purple-400 rounded-full opacity-80 animate-bounce" style={{animationDelay: '0.6s'}}></div>
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-center text-gray-800 mb-2">
              Meeting Created! 🎉
            </h2>
            <p className="text-center text-gray-600 mb-4 text-sm">
              Your meeting is ready. Share this link with participants:
            </p>
            
            {/* Meeting Info Card - Compact */}
            <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg p-3 border border-blue-200 mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-blue-600 font-medium">MEETING ID</span>
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-mono">{createdMeetingId}</span>
              </div>
              
              <div className="bg-white rounded p-2 border border-blue-100">
                <div className="flex items-center space-x-1">
                  <input
                    type="text"
                    value={`${window.location.origin}/join-meeting?meetingId=${createdMeetingId}`}
                    readOnly
                    className="flex-1 text-xs text-gray-700 bg-transparent outline-none"
                  />
                  <button
                    onClick={() => {
                      const meetingLink = `${window.location.origin}/join-meeting?meetingId=${createdMeetingId}`;
                      navigator.clipboard.writeText(meetingLink);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 3000);
                    }}
                    className={`p-1.5 rounded ${copied ? 'bg-green-500' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors cursor-pointer`}
                  >
                    {copied ? (
                      <FaCheck className="text-xs" />
                    ) : (
                      <FaCopy className="text-xs" />
                    )}
                  </button>
                </div>
              </div>
              
              {copied && (
                <div className="mt-1 text-center">
                  <span className="text-xs text-green-600 font-medium">✓ Copied!</span>
                </div>
              )}
            </div>
            
            {/* Standard Size Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  window.open(`/meeting/${createdMeetingId}`, '_blank');
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-bold py-2.5 px-4 rounded-lg text-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center cursor-pointer"
              >
                <FaArrowRight className="mr-2" />
                Join Meeting
              </button>
              
              <button
                onClick={() => setCreatedMeetingId('')}
                className="w-full bg-white text-blue-600 font-medium py-2.5 px-4 rounded-lg border border-blue-200 hover:bg-blue-50 transition-all duration-300 flex items-center justify-center cursor-pointer"
              >
                <FaRocket className="mr-2" />
                Create Another
              </button>
            </div>
            
            {/* Quick Tips - Compact */}
            <div className="mt-4 pt-3 border-t border-blue-100">
              <h3 className="text-xs font-medium text-gray-600 mb-1">QUICK TIPS:</h3>
              <ul className="text-xs text-gray-600 space-y-1">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Share the link with your team</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>No login required</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Works on all devices</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
      
      {/* Decorative Elements - Smaller */}
      <div className="absolute top-10 left-10 w-3 h-3 bg-blue-200 rounded-full opacity-50 animate-pulse"></div>
      <div className="absolute top-20 right-20 w-4 h-4 bg-emerald-200 rounded-full opacity-50 animate-pulse" style={{animationDelay: '0.5s'}}></div>
      <div className="absolute bottom-20 left-20 w-2 h-2 bg-cyan-200 rounded-full opacity-50 animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-10 right-10 w-3 h-3 bg-purple-200 rounded-full opacity-50 animate-pulse" style={{animationDelay: '1.5s'}}></div>
    </div>
  );
};

export default CreateMeeting;