const mongoose = require('mongoose');
const Meeting = require('../models/Meeting');
const asyncHandler = require('../utils/asyncHandler');

// Create a new meeting
const createMeeting = asyncHandler(async (req, res) => {
  const { meetingId } = req.body;
  let { userId } = req.body;

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
});

// Join a meeting
const joinMeeting = asyncHandler(async (req, res) => {
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

    // First, check if meeting exists
    const meetingExists = await Meeting.findOne({ meetingId });
    if (!meetingExists) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    // Use atomic operations to handle concurrent updates
    // First, try to add user if not already in participants
    let result = await Meeting.findOneAndUpdate(
      { 
        meetingId: meetingId,
        participants: { $ne: userId } // Only update if user is NOT in participants
      },
      { 
        $push: { participants: userId },
        $set: { updatedAt: new Date() }
      },
      { 
        new: true,
        runValidators: true 
      }
    );

    let isNewParticipant = true;

    // If the above didn't work, user might already be in the meeting
    if (!result) {
      // Check if user is already in meeting and update their position
      result = await Meeting.findOneAndUpdate(
        { 
          meetingId: meetingId,
          participants: userId // Only update if user IS in participants
        },
        { 
          $pull: { participants: userId }, // Remove user first
        },
        { new: false } // Get the document before update
      );

      if (result) {
        // Now add them back at the end (to show as most recent/active)
        result = await Meeting.findOneAndUpdate(
          { meetingId: meetingId },
          { 
            $push: { participants: userId },
            $set: { updatedAt: new Date() }
          },
          { 
            new: true,
            runValidators: true 
          }
        );
        isNewParticipant = false;
        console.log(`Updated existing participant ${userId} in meeting ${meetingId}`);
      } else {
        // This shouldn't happen, but let's handle it gracefully
        result = await Meeting.findOneAndUpdate(
          { meetingId: meetingId },
          { 
            $addToSet: { participants: userId }, // Use $addToSet to avoid duplicates
            $set: { updatedAt: new Date() }
          },
          { 
            new: true,
            runValidators: true 
          }
        );
        console.log(`Force added participant ${userId} to meeting ${meetingId}`);
      }
    } else {
      console.log(`Added new participant ${userId} to meeting ${meetingId}`);
    }

    if (!result) {
      throw new Error('Failed to join meeting. Please try again.');
    }

    // Limit participants to reasonable number to prevent abuse
    if (result.participants.length > 50) {
      result = await Meeting.findOneAndUpdate(
        { meetingId: meetingId },
        { 
          participants: result.participants.slice(-50) // Keep only the 50 most recent
        },
        { new: true }
      );
    }

    res.status(200).json({
      meeting: result,
      userId: userId, // Return the userId (guest or authenticated) for future requests
      message: 'Joined meeting successfully',
      isNewParticipant: isNewParticipant,
      isHost: result.hostId.toString() === userId.toString()
    });

  } catch (error) {
    console.error('Error in joinMeeting:', error);
    res.status(500).json({ message: error.message });
  }
});

// Leave a meeting
const leaveMeeting = asyncHandler(async (req, res) => {
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
});

module.exports = {
  createMeeting,
  joinMeeting,
  leaveMeeting,
};