@echo off
echo ==========================================
echo       MONEYMITRA DEBUG LAUNCHER
echo ==========================================
echo.
echo Attempting to start Web Admin...
cd web_admin

echo Checking Node Version...
node -v
echo Checking NPM Version...
call npm -v

echo.
echo Starting Vite Server...
echo If this fails, please take a screenshot of this window!
echo.

call npm run dev

echo.
echo ==========================================
echo SERVER CRASHED OR STOPPED
echo ==========================================
pause
