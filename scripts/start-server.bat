@echo off
cd /d "%~dp0.."
echo Starting BBC Cashiering System...
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:3000"
npm run start
