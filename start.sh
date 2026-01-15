@echo off

rem Start the API server
cd API
start cmd /k npm start

rem Start the UI
cd ..\UI
start cmd /k npm run dev