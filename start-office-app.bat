@echo off
title Office App Startup

echo ========================================
echo   FLTOPS Office System - Starting...
echo ========================================

:: Wait for Docker Desktop to be fully ready
echo Waiting for Docker to start...
:WAIT_DOCKER
docker info >nul 2>&1
if %errorlevel% neq 0 (
    timeout /t 5 /nobreak >nul
    goto WAIT_DOCKER
)

echo Docker is ready!

:: Navigate to project folder — UPDATE THIS PATH
cd /d C:\Users\HenokGs\Desktop\office_projects

:: Pull any image updates (optional — remove if no internet)
:: docker-compose pull

:: Start all containers
echo Starting Office App containers...
docker-compose up --build -d

echo ========================================
echo   App is LIVE at http://localhost
echo   Share with office: http://%COMPUTERNAME%
echo ========================================

:: Open browser automatically
timeout /t 5 /nobreak >nul
start http://localhost

exit
```

---

## 6. ⚙️ Set App to Auto-Start on Windows Boot

**Step 1** — Press `Win + R`, type:
```
shell:startup
```
Hit Enter — this opens the Windows Startup folder.

**Step 2** — Create a shortcut of `start-office-app.bat` and paste it there.

**Step 3** — Right-click the shortcut → Properties → Advanced → check **"Run as administrator"**

Now every time the PC boots, Docker starts and your app comes up automatically.

---

## 7. 🔧 Docker Desktop Settings (One-time)

Open Docker Desktop → Settings:
```
✅ General → "Start Docker Desktop when you log in" — ENABLE
✅ General → "Start when system starts" — ENABLE  
✅ Resources → set Memory to at least 2GB