# Healthcare Platform - Simple Startup Script
# Double-click this file or run: .\start-servers.ps1

Clear-Host
Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "  Healthcare Platform Startup" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Stop existing servers
Write-Host "Stopping old servers..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Start Backend Server
Write-Host "Starting Backend Server..." -ForegroundColor Green
Start-Process cmd -ArgumentList "/k", "cd /d $PSScriptRoot && node src/server.js" -WindowStyle Normal

Start-Sleep -Seconds 3

# Start Frontend Server
Write-Host "Starting Frontend Server..." -ForegroundColor Green
Start-Process cmd -ArgumentList "/k", "cd /d $PSScriptRoot\frontend && npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "===================================" -ForegroundColor Green
Write-Host "  Servers Started Successfully!" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  http://localhost:3000" -ForegroundColor White
Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "Check the opened windows for logs." -ForegroundColor Gray
Write-Host "Close those windows to stop servers." -ForegroundColor Gray
Write-Host ""

# Wait 5 seconds then close this window
Start-Sleep -Seconds 5
while ($true) {
    Start-Sleep -Seconds 10
}
