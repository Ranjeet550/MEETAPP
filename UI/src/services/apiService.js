const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create a new meeting
const createMeeting = async (meetingId, userId) => {
  try {
    const response = await fetch(`${API_URL}/api/meetings/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ meetingId, userId }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error creating meeting:', error);
    throw error;
  }
};

// Join a meeting
const joinMeeting = async (meetingId, userId) => {
  try {
    const response = await fetch(`${API_URL}/api/meetings/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ meetingId, userId }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error joining meeting:', error);
    throw error;
  }
};

// Leave a meeting
const leaveMeeting = async (meetingId, userId) => {
  try {
    const response = await fetch(`${API_URL}/api/meetings/leave`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ meetingId, userId }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error leaving meeting:', error);
    throw error;
  }
};

// Register a user
const registerUser = async (name, email, password) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    
    return data;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Login a user
const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    
    return data;
  } catch (error) {
    console.error('Error logging in user:', error);
    throw error;
  }
};

export { createMeeting, joinMeeting, leaveMeeting, registerUser, loginUser };