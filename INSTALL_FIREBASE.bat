@echo off
echo ========================================
echo MoneyMitra Firebase Setup
echo ========================================
echo.

cd /d "%~dp0web_admin"

echo Installing Firebase...
npm install firebase

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Next Steps:
echo 1. Follow FIREBASE_SETUP_GUIDE.md to configure Firebase
echo 2. Update src/firebase.ts with your Firebase credentials
echo 3. Run: npm run dev
echo.
pause
