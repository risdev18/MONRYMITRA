@echo off
echo ==========================================
echo       MONEYMITRA LAUNCHER
echo ==========================================
echo.
echo [1] Start Web Admin + Backend (Recommended)
echo [2] Start Backend Only
echo [3] Start Mobile App (Requires SDK)
echo [4] Install Dependencies
echo [5] Exit
echo.
set /p choice="Select an option (1-5): "

if "%choice%"=="1" (
    echo Starting Backend...
    start "MoneyMitra Backend" cmd /k "cd backend && npm run dev"
    timeout /t 5
    echo Starting Web Admin...
    start "MoneyMitra Web Admin" cmd /k "cd web_admin && npm run dev"
    
    echo Opening Dashboard...
    timeout /t 3
    start http://localhost:5173
)

if "%choice%"=="2" (
    echo Starting Backend...
    start "MoneyMitra Backend" cmd /k "cd backend && npm run dev"
)

if "%choice%"=="3" (
    echo Launching Mobile App...
    start "MoneyMitra Mobile App" cmd /k "cd mobile_app && flutter run"
)

if "%choice%"=="4" (
    echo Installing Backend Deps...
    cd backend
    call npm install
    echo Installing Web Admin Deps...
    cd ../web_admin
    call npm install
    echo Done.
    pause
)

if "%choice%"=="5" (
    exit
)
