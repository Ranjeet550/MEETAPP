#!/bin/bash

# Start the API server
cd API || { echo "Failed to enter API directory"; exit 1; }
npm start &

# Start the UI
cd UI || { echo "Failed to enter UI directory"; exit 1; }
npm run dev