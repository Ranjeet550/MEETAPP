const express = require('express');

const setupRoutes = (app) => {
  // Home route
  app.get('/', (req, res) => {
    res.send('Google Meet Clone API');
  });

  // Meeting routes
  app.use('/api/meetings', require('../routes/meetingRoutes'));

  // Authentication routes
  app.use('/api/auth', require('../routes/authRoutes'));
};

module.exports = setupRoutes;