# Healthcare Vault - Startup Script
# Run: .\start-servers.ps1

Clear-Host
Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "  Healthcare Vault Startup" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Get project root
$ProjectRoot = $PSScriptRoot

# Stop existing node processes
Write-Host "Stopping old servers..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "Done." -ForegroundColor Green

# Start Backend Server in a new window
Write-Host ""
Write-Host "Starting Backend (port 5000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$ProjectRoot'; Write-Host 'BACKEND SERVER' -ForegroundColor Cyan; node Backend/server.js"

# Start Frontend Server in a new window
Write-Host "Starting Frontend (port 3000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$ProjectRoot\frontend'; Write-Host 'FRONTEND SERVER' -ForegroundColor Cyan; npm run dev"

# Wait for both to come up
Start-Sleep -Seconds 4

Write-Host ""
Write-Host "===================================" -ForegroundColor Green
Write-Host "  Both Servers Launched!" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  http://localhost:5000" -ForegroundColor White
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Two new windows opened - one for each server." -ForegroundColor Gray
Write-Host "Close those windows to stop the servers." -ForegroundColor Gray
Write-Host ""

# Open browser
Start-Process "http://localhost:3000"
