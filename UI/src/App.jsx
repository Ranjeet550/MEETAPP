import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { NotificationProvider } from './contexts/NotificationContext';
import NotificationContainer from './components/common/NotificationContainer';
import Navbar from './components/common/Navbar';
import Home from './components/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import CreateMeeting from './components/meeting/CreateMeeting';
import JoinMeeting from './components/meeting/JoinMeeting';
import MeetingRoom from './components/meeting/MeetingRoomRefactored';

const JoinMeetingRedirect = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const meetingId = searchParams.get('meetingId');
    if (meetingId) {
      navigate(`/meeting/${meetingId}`);
    }
  }, [searchParams, navigate]);

  return null;
};

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
          <Route path="/join-meeting" element={<JoinMeetingRedirect />} />
          <Route path="/meeting/:meetingId" element={<MeetingRoom />} />
        </Routes>
        <NotificationContainer />
      </Router>
    </NotificationProvider>
  );
}

export default App;
