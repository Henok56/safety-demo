@echo off
echo --- STARTING PRODUCTION UPDATE ---

:: 1. Build the Frontend
echo Navigating to Frontend...
cd frontend
echo Building React optimized files...
call npm run build

:: 2. Sync Build to Backend (Optional but recommended)
:: This ensures the 'back' folder has the latest 'build'
echo Syncing build to backend...
xcopy /s /y /i build ..\back\build

:: 3. Restart the Backend
echo Navigating to Backend...
cd ..\back
echo Restarting PM2 process...
pm2 restart all

echo --- DEPLOYMENT COMPLETE ---
echo Your colleagues can now refresh their browsers.
pause