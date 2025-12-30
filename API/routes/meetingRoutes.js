const express = require('express');
const router = express.Router();
const { createMeeting, joinMeeting, leaveMeeting } = require('../controllers/meetingController');

// Create a new meeting
router.post('/create', createMeeting);

// Join a meeting
router.post('/join', joinMeeting);

// Leave a meeting
router.post('/leave', leaveMeeting);

module.exports = router;