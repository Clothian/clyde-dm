@echo off
echo Starting Clyde DM Application...
echo.

REM Kill any process already using port 5000
echo Checking for processes using port 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
    echo Terminating process with PID: %%a
    taskkill /PID %%a /F > nul 2>&1
)
echo Port 5000 is now free.
echo.

REM Start Backend in a new window
start cmd /k "cd backend && npm install && npm run dev"

REM Give backend time to start
timeout /t 5

REM Start Frontend in another window on port 3000
start cmd /k "npm run dev -- --port 3000"

echo.
echo Servers started! The application should open in your browser shortly.
echo Frontend is running at http://localhost:3000
echo Backend API is running at http://localhost:5000 