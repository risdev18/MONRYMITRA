@echo off
title MoneyMitra Build APK
cd ../mobile_app
echo Cleaning build...
call flutter clean
call flutter pub get
echo Building Release APK...
call flutter build apk --release
echo.
echo Build Complete!
echo APK location: mobile_app/build/app/outputs/flutter-apk/app-release.apk
pause
