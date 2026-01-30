@echo off
cls
echo.
echo ===================================
echo   Healthcare Platform Startup
echo ===================================
echo.

:: Kill any existing node processes
echo Stopping old servers...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

:: Start Backend Server
echo Starting Backend Server...
start "Healthcare Backend" cmd /k "cd /d %~dp0 && node src/server.js"
timeout /t 3 /nobreak >nul

:: Start Frontend Server
echo Starting Frontend Server...
start "Healthcare Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ===================================
echo   Servers Started Successfully!
echo ===================================
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:5173
echo.
echo Check the opened windows for logs.
echo Close those windows to stop servers.
echo.
pause
