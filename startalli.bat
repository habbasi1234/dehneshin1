@echo off
title Az Choob Iranian - Startup Script
color 0A

echo ========================================
echo    Az Choob Iranian - Starting System
echo ========================================
echo.

:: Check if MongoDB container is running
echo [1/3] Checking Docker MongoDB container...
docker ps --format "{{.Names}}" | findstr "dehneshin-mongodb" >nul

if errorlevel 1 (
    echo [INFO] Starting MongoDB via Docker...
    cd /d "H:\mobl"
    docker compose up -d
    if errorlevel 1 (
        echo [ERROR] Failed to start MongoDB via Docker!
        pause
        exit /b 1
    )
    echo [WAIT] Waiting for MongoDB to initialize...
    timeout /t 5 /nobreak >nul
    echo [SUCCESS] MongoDB started successfully!
) else (
    echo [SUCCESS] MongoDB is already running!
)

echo.

:: Start the Node.js server
echo [2/3] Starting Node.js server on port 5000...

:: Create logs directory if it doesn't exist
if not exist "H:\mobl\server" (
    echo [ERROR] Server directory not found: H:\mobl\server
    pause
    exit /b 1
)

:: Start server in new window
start "Az Choob Server" cmd /c "cd /d H:\mobl\server && node index.js > server.log 2> server_err.log"

echo [WAIT] Waiting for server to initialize...
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo    STATUS: SYSTEM RUNNING
echo ========================================
echo.
echo    [SUCCESS] Server started successfully!
echo.
echo    ACCESS POINTS:
echo    ---------------
echo    Main Site:    http://localhost:5000
echo    Admin Panel:  http://localhost:5000/admin
echo.
echo    LOG FILES:
echo    ---------------
echo    Server Log:   H:\mobl\server\server.log
echo    Error Log:    H:\mobl\server\server_err.log
echo.
echo    TROUBLESHOOTING:
echo    ---------------
echo    - Check server logs if site is not accessible
echo    - Verify MongoDB is running: docker ps
echo    - Stop server: Close the server window
echo    - Restart: Re-run this batch file
echo.
echo ========================================
echo Press any key to open website...
pause >nul

:: Open browser to localhost
start http://localhost:5000

echo.
echo [INFO] Browser opened. Press any key to exit this window...
pause >nul
exit /b 0