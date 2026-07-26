# ده نشین - Start Script
# Run this script to start both server and client

Write-Host "🔄 Starting Deh Neshin..." -ForegroundColor Cyan

# Check Docker
$dockerRunning = docker ps --format "{{.Names}}" 2>$null | Select-String "dehneshin-mongodb"
if (-not $dockerRunning) {
    Write-Host "📦 Starting MongoDB via Docker..." -ForegroundColor Yellow
    Set-Location "H:\mobl"
    docker compose up -d
    Start-Sleep -Seconds 5
    Write-Host "✅ MongoDB started" -ForegroundColor Green
} else {
    Write-Host "✅ MongoDB already running" -ForegroundColor Green
}

# Start server
Write-Host "🚀 Starting server (port 5000)..." -ForegroundColor Yellow
$serverLog = "H:\mobl\server\server.log"
$serverErr = "H:\mobl\server\server_err.log"
Start-Process -NoNewWindow -FilePath "node" -ArgumentList "index.js" -WorkingDirectory "H:\mobl\server" -RedirectStandardOutput $serverLog -RedirectStandardError $serverErr

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "╔════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅ Deh Neshin is running!         ║" -ForegroundColor Green
Write-Host "╠════════════════════════════════════╣" -ForegroundColor Green
Write-Host "║  🌐 Site:  http://localhost:5000    ║" -ForegroundColor Cyan
Write-Host "║  🔧 Admin: http://localhost:5000/admin ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Server logs: $serverLog" -ForegroundColor Gray
