@echo off
title MoneyMitra Backend
cd ../backend
echo Installing dependencies...
call npm install
echo Starting Server...
npm run dev
pause
