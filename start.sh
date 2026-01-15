#!/bin/bash

# Start the API server
cd API && npm start &

# Start the UI
cd ../UI && npm run dev