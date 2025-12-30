const mongoose = require('mongoose');
const Meeting = require('../models/Meeting');

// Create a new meeting
const createMeeting = async (req, res) => {
  const { meetingId } = req.body;
  let { userId } = req.body;

  try {
    // Validate that userId is a valid MongoDB ObjectId
    // If not valid (e.g. legacy guest ID or garbage), treat as new guest
    if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
      console.warn(`Invalid user ID format: ${userId}, generating new guest ID`);
      userId = null;
    }

    // Allow guest users - generate a temporary guest ID if no userId provided
    if (!userId) {
      // Generate a temporary guest user ID
      userId = new mongoose.Types.ObjectId();
    }

    const meeting = await Meeting.create({
      meetingId,
      hostId: userId,
      participants: [userId],
    });

    res.status(201).json({
      meeting,
      userId, // Return the userId (guest or authenticated) for future requests
      message: 'Meeting created successfully'
    });
  } catch (error) {
    if (error.code === 11000) {
      // Handle duplicate meetingId error
      res.status(400).json({ message: 'Meeting ID already exists' });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

// Join a meeting
const joinMeeting = async (req, res) => {
  const { meetingId } = req.body;
  let { userId } = req.body;

  try {
    // Validate that userId is a valid MongoDB ObjectId
    // If not valid (e.g. legacy guest ID or garbage), treat as new guest
    if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
      console.warn(`Invalid user ID format: ${userId}, generating new guest ID`);
      userId = null;
    }

    // Allow guest users - generate a temporary guest ID if no userId provided
    if (!userId) {
      // Generate a temporary guest user ID
      userId = new mongoose.Types.ObjectId();
    }

    const meeting = await Meeting.findOne({ meetingId });

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    // Check if user is already in the meeting
    const userIndex = meeting.participants.findIndex(
      participant => participant.toString() === userId.toString()
    );

    if (userIndex === -1) {
      // User not in meeting, add them
      meeting.participants.push(userId);
      console.log(`Added new participant ${userId} to meeting ${meetingId}`);
    } else {
      // User already in meeting, update their position (move to end to show as active)
      meeting.participants.splice(userIndex, 1);
      meeting.participants.push(userId);
      console.log(`Updated existing participant ${userId} in meeting ${meetingId}`);
    }

    // Limit participants to reasonable number to prevent abuse
    if (meeting.participants.length > 50) {
      meeting.participants = meeting.participants.slice(-50); // Keep only the 50 most recent
    }

    await meeting.save();

    res.status(200).json({
      meeting,
      userId, // Return the userId (guest or authenticated) for future requests
      message: 'Joined meeting successfully',
      isNewParticipant: userIndex === -1 // Indicate if this was a new participant
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Leave a meeting
const leaveMeeting = async (req, res) => {
  const { meetingId, userId } = req.body;

  try {
    const meeting = await Meeting.findOne({ meetingId });

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    // Check if user is actually in the meeting
    const userIndex = meeting.participants.findIndex(
      (participant) => participant.toString() === userId
    );

    if (userIndex !== -1) {
      meeting.participants.splice(userIndex, 1);
      await meeting.save();
    }

    res.status(200).json({
      meeting,
      message: 'Left meeting successfully',
      updatedParticipants: meeting.participants
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createMeeting,
  joinMeeting,
  leaveMeeting,
};