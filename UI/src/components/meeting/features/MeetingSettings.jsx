import { useState, useEffect } from 'react';
import { FaCog, FaCamera, FaMicrophone, FaVolumeUp, FaUsers, FaPoll, FaInfoCircle, FaLink, FaCopy, FaCheck } from 'react-icons/fa';
import Polls from './Polls';
import BreakoutRooms from './BreakoutRooms';

const MeetingSettings = ({ 
  // Settings props
  onCameraChange,
  onMicrophoneChange,
  onSpeakerChange,
  availableDevices = { cameras: [], microphones: [], speakers: [] },
  currentDevices = { camera: '', microphone: '', speaker: '' },
  
  // Breakout Rooms props
  isHost = false,
  participants = [],
  participantNames = {},
  onCreateRooms,
  onJoinRoom,
  onCloseRooms,
  breakoutRooms = [],
  currentRoom = null,
  
  // Polls props
  socketRef,
  meetingId,
  userId,
  
  // Meeting Info props
  meetingTitle = '',
  startTime,
  duration,
  participantCount,
  meetingLink,
  hostName = '',
  
  // Modal control
  openTab = null,
  onClose = () => {}
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('settings');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (openTab) {
      setIsOpen(true);
      setActiveTab(openTab);
    }
  }, [openTab]);

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    { id: 'settings', label: 'Settings', icon: FaCog },
    { id: 'info', label: 'Meeting Info', icon: FaInfoCircle },
    { id: 'polls', label: 'Polls', icon: FaPoll },
    { id: 'breakout', label: 'Breakout Rooms', icon: FaUsers, hidden: !isHost && breakoutRooms.length === 0 }
  ];

  const renderSettings = () => (
    <div className="space-y-6">
      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Device Settings</h4>
      
      {/* Camera Selection */}
      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
        <label className="flex items-center text-sm font-bold text-gray-700 mb-3">
          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mr-3">
            <FaCamera />
          </div>
          Camera
        </label>
        <select
          value={currentDevices.camera}
          onChange={(e) => onCameraChange?.(e.target.value)}
          className="w-full bg-white border-2 border-gray-100 focus:border-blue-500 rounded-xl px-4 py-3 outline-none transition-all font-medium text-gray-700"
        >
          <option value="">Select Camera</option>
          {availableDevices.cameras.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Camera ${device.deviceId.substring(0, 8)}`}
            </option>
          ))}
        </select>
      </div>

      {/* Microphone Selection */}
      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
        <label className="flex items-center text-sm font-bold text-gray-700 mb-3">
          <div className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mr-3">
            <FaMicrophone />
          </div>
          Microphone
        </label>
        <select
          value={currentDevices.microphone}
          onChange={(e) => onMicrophoneChange?.(e.target.value)}
          className="w-full bg-white border-2 border-gray-100 focus:border-blue-500 rounded-xl px-4 py-3 outline-none transition-all font-medium text-gray-700"
        >
          <option value="">Select Microphone</option>
          {availableDevices.microphones.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Microphone ${device.deviceId.substring(0, 8)}`}
            </option>
          ))}
        </select>
      </div>

      {/* Speaker Selection */}
      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
        <label className="flex items-center text-sm font-bold text-gray-700 mb-3">
          <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mr-3">
            <FaVolumeUp />
          </div>
          Speaker
        </label>
        <select
          value={currentDevices.speaker}
          onChange={(e) => onSpeakerChange?.(e.target.value)}
          className="w-full bg-white border-2 border-gray-100 focus:border-blue-500 rounded-xl px-4 py-3 outline-none transition-all font-medium text-gray-700"
        >
          <option value="">Select Speaker</option>
          {availableDevices.speakers.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Speaker ${device.deviceId.substring(0, 8)}`}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => {
          setIsOpen(true);
          setActiveTab('settings');
        }}
        className="w-full h-12 rounded-xl bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center transition-all duration-200"
        title="Settings"
      >
        <FaCog className="w-4 h-4 mr-2" />
        <span className="text-sm font-medium">Settings</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop - Excludes bottom area where control bar is */}
          <div 
            className="fixed left-0 right-0 top-0 bg-black bg-opacity-50 z-[10000]"
            style={{ 
              bottom: '120px' // Don't cover the control bar area (control bar is at bottom-3 + height ~80px)
            }}
            onClick={handleClose}
          />
          
          {/* Modal Panel - Positioned above control bar */}
          <div 
            className="fixed left-1/2 transform -translate-x-1/2 z-[10001] w-[95%] max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            style={{ 
              bottom: 'clamp(100px, 12vh, 140px)', // Responsive: well above control bar on all screen sizes
              maxHeight: 'min(calc(100vh - 200px), 85vh)' // Responsive max height
            }}
          >
            {/* Header */}
            <div className="px-8 py-6 border-b flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-2xl font-black text-gray-800 tracking-tight">Meeting Dashboard</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Manage all features in one place</p>
              </div>
              <button
                onClick={handleClose}
                className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-gray-200 text-gray-500 transition-all text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar Tabs */}
              <div className="w-64 bg-gray-50 border-r p-4 space-y-2 hidden md:block">
                {tabs.filter(t => !t.hidden).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${
                      activeTab === tab.id 
                        ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 translate-x-2' 
                        : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'
                    }`}
                  >
                    <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-gray-400'}`} />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Mobile Tabs */}
              <div className="md:hidden border-b flex overflow-x-auto p-2 bg-gray-50">
                {tabs.filter(t => !t.hidden).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                      activeTab === tab.id 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon className="w-3 h-3" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
              
              {/* Content Area */}
              <div className="flex-1 overflow-y-auto p-8 bg-white">
                {activeTab === 'settings' && renderSettings()}
                
                {activeTab === 'info' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div>
                      <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Meeting Credentials</h4>
                      <div className="grid gap-4">
                        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 relative group">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Meeting ID</label>
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xl font-bold text-gray-800">{meetingId}</span>
                            <button 
                              onClick={() => copyToClipboard(meetingId)}
                              className="w-10 h-10 bg-white shadow-sm border border-gray-100 rounded-xl flex items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-all"
                            >
                              {copied ? <FaCheck className="text-green-500" /> : <FaCopy />}
                            </button>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 relative">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Invite Link</label>
                          <div className="flex items-center space-x-3">
                            <div className="flex-1 bg-white border border-gray-100 rounded-xl px-4 py-2 text-sm text-blue-600 font-medium truncate">
                              {meetingLink}
                            </div>
                            <button 
                              onClick={() => copyToClipboard(meetingLink)}
                              className="w-10 h-10 bg-white shadow-sm border border-gray-100 rounded-xl flex items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-all"
                            >
                              {copied ? <FaCheck className="text-green-500" /> : <FaCopy />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
                        <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-2">Host</label>
                        <div className="text-lg font-bold text-blue-900">{hostName || 'Not available'}</div>
                      </div>
                      <div className="bg-green-50/50 p-6 rounded-3xl border border-green-100">
                        <label className="text-[10px] font-black text-green-400 uppercase tracking-widest block mb-2">Participants</label>
                        <div className="text-lg font-bold text-green-900">{participantCount} Active</div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'polls' && (
                  <div className="h-full animate-in fade-in duration-300">
                    <Polls 
                      isHost={isHost}
                      socketRef={socketRef}
                      meetingId={meetingId}
                      userId={userId}
                      participantNames={participantNames}
                      contentOnly={true}
                    />
                  </div>
                )}

                {activeTab === 'breakout' && (
                  <div className="h-full animate-in fade-in duration-300">
                    <BreakoutRooms 
                      isHost={isHost}
                      participants={participants}
                      participantNames={participantNames}
                      onCreateRooms={onCreateRooms}
                      onJoinRoom={onJoinRoom}
                      onCloseRooms={onCloseRooms}
                      breakoutRooms={breakoutRooms}
                      currentRoom={currentRoom}
                      contentOnly={true}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default MeetingSettings;
