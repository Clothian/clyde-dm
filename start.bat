@echo off
echo Starting Clyde DM Application...
echo.

REM Check for Ollama availability
echo Testing Ollama availability at http://localhost:11434...
curl -s -o nul -w "%%{http_code}" http://localhost:11434/api/tags 2>nul | findstr "200" >nul
if not %errorlevel% == 0 (
    echo WARNING: Ollama does not appear to be running on port 11434.
    echo Memory features will not work unless Ollama is running.
    echo.
    echo To use memory features:
    echo 1. Install Ollama from https://ollama.com/download
    echo 2. Run Ollama
    echo 3. Pull the model using: ollama pull qwen3:8b-q4_K_M
    echo.
    echo Press any key to continue without memory features or Ctrl+C to cancel...
    pause >nul
)

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