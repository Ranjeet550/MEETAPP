import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NotificationProvider } from './contexts/NotificationContext';
import NotificationContainer from './components/common/NotificationContainer';
import Navbar from './components/common/Navbar';
import Home from './components/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import CreateMeeting from './components/meeting/CreateMeeting';
import JoinMeeting from './components/meeting/JoinMeeting';
import MeetingRoom from './components/meeting/MeetingRoomRefactored';

function App() {
  return (
    <NotificationProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/create-meeting" element={<CreateMeeting />} />
          <Route path="/join-meeting" element={<JoinMeeting />} />
          <Route path="/meeting/:meetingId" element={<MeetingRoom />} />
        </Routes>
        <NotificationContainer />
      </Router>
    </NotificationProvider>
  );
}

export default App;
