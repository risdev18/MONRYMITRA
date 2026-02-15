@echo off
echo Starting MoneyMitra Development Environment...

REM Start Backend in a new window
echo Starting Backend Server...
start "MoneyMitra Backend" cmd /k "cd backend && npm run dev"

REM Wait a moment for backend to initialize
timeout /t 5

REM Start Flutter App in a new window
echo Starting Mobile App...
start "MoneyMitra Mobile App" cmd /k "cd mobile_app && flutter run"

echo Environment Started! 
echo Backend running on Port 3000
echo Mobile App launching...
