Write-Host "========================================" -ForegroundColor Yellow
Write-Host "   DEH NESHIN - LAUNCH ALL" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

Write-Host "[1/5] Starting MongoDB container..." -ForegroundColor Cyan
docker start dehneshin-mongodb 2>$null
if ($LASTEXITCODE -ne 0) {
    docker run -d --name dehneshin-mongodb -p 27017:27017 `
        -e MONGO_INITDB_ROOT_USERNAME=dehneshin `
        -e MONGO_INITDB_ROOT_PASSWORD=dehneshin_secret_1404 `
        mongo:7
}

Write-Host "    Waiting for MongoDB..." -ForegroundColor Gray
do {
    $r = docker exec dehneshin-mongodb mongosh -u admin -p dehneshin_secret_1404 --eval "db.runCommand({ping:1})" --quiet 2>$null
    if ($r -match "ok") { break }
    Start-Sleep -Seconds 2
} while ($true)
Write-Host "    MongoDB ready!" -ForegroundColor Green

Write-Host "[2/5] Stopping old processes..." -ForegroundColor Cyan
Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
Start-Sleep -Seconds 2

Write-Host "[3/5] Starting Backend (port 5000)..." -ForegroundColor Cyan
Start-Process powershell -WindowStyle Normal -ArgumentList "-NoExit", "-Command", "Set-Location 'H:\dehnesin\server'; node --watch index.js"
Start-Sleep -Seconds 3

Write-Host "[4/5] Starting Frontend (port 5173)..." -ForegroundColor Cyan
Start-Process powershell -WindowStyle Normal -ArgumentList "-NoExit", "-Command", "Set-Location 'H:\dehnesin\client'; npm run dev"
Start-Sleep -Seconds 5

Write-Host "[5/5] Opening browser..." -ForegroundColor Cyan
Start-Process "http://localhost:5173"

Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "  ALL SERVICES RUNNING" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Yellow
Write-Host " Frontend:  http://localhost:5173" -ForegroundColor White
Write-Host " Backend:   http://localhost:5000" -ForegroundColor White
Write-Host " Admin:     http://localhost:5173/admin" -ForegroundColor White
Write-Host " Login:     admin / dehnesin@1404" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Yellow
