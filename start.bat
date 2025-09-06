@echo off
echo ⚡ Starting FitCore - Ultimate Fitness Companion...
echo ==================================

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Start backend
echo 🚀 Starting backend server...
cd backend
call npm install
start "Backend Server" cmd /k "npm run dev"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend
echo 🎨 Starting frontend server...
cd ..\frontend
call npm install
start "Frontend Server" cmd /k "npm start"

echo ✅ Both servers are starting up!
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend: http://localhost:5000
echo.
echo Press any key to exit...
pause >nul
