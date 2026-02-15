@echo off
title MoneyMitra Mobile App
cd ../mobile_app
echo Getting packages...
call flutter pub get
echo Launching App...
flutter run
pause
