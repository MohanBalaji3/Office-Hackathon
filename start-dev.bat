@echo off
REM Quick Start Script for Defect Analyzer with Local Server
REM This script sets up and runs both frontend and backend servers

echo ==========================================
echo Defect Analyzer - Local Server Setup
echo ==========================================
echo.

REM Check if LOVABLE_API_KEY is set
if "%LOVABLE_API_KEY%"=="" (
    echo WARNING: LOVABLE_API_KEY environment variable is not set
    echo Please set it before running:
    echo   set LOVABLE_API_KEY=your_api_key_here
    echo.
    pause
)

REM Install frontend dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
    echo.
)

REM Install server dependencies if server/node_modules doesn't exist
if not exist "server\node_modules" (
    echo Installing server dependencies...
    cd server
    call npm install
    cd ..
    echo.
)

REM Check if concurrently is installed
npm list concurrently >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing concurrently for running both servers...
    call npm install --save-dev concurrently
    echo.
)

echo ==========================================
echo Starting Defect Analyzer
echo ==========================================
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:4000
echo.
echo Press Ctrl+C to stop both servers
echo ==========================================
echo.

REM Run both servers
call npx concurrently "npm run dev" "cd server && npm start"

pause
