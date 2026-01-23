#!/bin/bash

# Check if node is available
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js."
    exit 1
fi

# Start the API server
cd /app/API || { echo "Failed to enter API directory"; exit 1; }
npm start