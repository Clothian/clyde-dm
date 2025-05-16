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

REM Kill any process already using port 5000 (backend)
echo Checking for processes using port 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
    echo Terminating process with PID: %%a
    taskkill /PID %%a /F > nul 2>&1
)
echo Port 5000 is now free.

REM Kill any process already using port 3000 (frontend)
echo Checking for processes using port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo Terminating process with PID: %%a
    taskkill /PID %%a /F > nul 2>&1
)
echo Port 3000 is now free.
echo.

REM Update DuckDNS with current public IP
echo Updating DuckDNS record...
for /f %%i in ('curl -s https://api.ipify.org') do set PUBLIC_IP=%%i
echo Your public IP is: %PUBLIC_IP%

set "DUCKDNS_TOKEN=b8920ae2-68fd-440d-8ae0-e33c79e43805"
echo Attempting to update DuckDNS with token: %DUCKDNS_TOKEN%
curl "https://www.duckdns.org/update?domains=sneakyjp&token=%DUCKDNS_TOKEN%&ip=%PUBLIC_IP%"
echo.
echo DuckDNS update command executed. Pausing for 2 seconds to see output.
timeout /t 2
echo.
echo Waiting for DNS update to propagate (10 seconds)...
timeout /t 10
echo.

REM Start Backend in a new window
echo Starting backend server...
start "ClydeDM Backend" cmd /k "cd backend && npm install && npm run dev"

REM Give backend time to start
echo Waiting for backend to initialize (5 seconds)...
timeout /t 5

REM Start Frontend in another window on port 3000 with host 0.0.0.0
echo Starting frontend server...
set HOST=0.0.0.0
start "ClydeDM Frontend" cmd /k "npm run dev -- --port 3000"

echo.
echo Servers are being started in new windows.
echo Frontend should be accessible at:
echo - Local: http://localhost:3000
echo - Network: http://sneakyjp.duckdns.org:3000 (if DuckDNS update was successful)
echo   (Your public IP: %PUBLIC_IP%)
echo Backend API should be running at http://localhost:5000
echo.
echo If the new windows close immediately, check them for error messages.
echo Press any key to exit this script.
pause >nul 