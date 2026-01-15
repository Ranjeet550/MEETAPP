#!/bin/bash

# Start the API server
cd /app/API || { echo "Failed to enter API directory"; exit 1; }
npm start &

# Start the UI
cd /app/UI || { echo "Failed to enter UI directory"; exit 1; }
npm run dev