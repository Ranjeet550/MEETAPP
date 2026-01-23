#!/bin/bash
set -e

echo "Installing API dependencies..."
cd API
npm install

echo "Installing UI dependencies..."
cd ../UI
npm install

echo "Building UI..."
npm run build

echo "Build complete!"
