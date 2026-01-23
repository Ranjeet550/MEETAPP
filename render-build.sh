#!/bin/bash
set -e

echo "Installing API dependencies..."
cd /app/API
npm install

echo "Installing UI dependencies..."
cd /app/UI
npm install

echo "Building UI..."
npm run build

echo "Build complete!"
