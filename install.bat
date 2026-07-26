@echo off
cd /d "%~dp0"
title ده نشین - نصب وابستگی‌ها

echo ============================================
echo      ده نشین | محصولات ارگانیک و طبیعی
echo       نصب تمام نیازمندی‌های پروژه
echo ============================================
echo.
echo این فایل تمام پکیج‌های مورد نیاز را نصب می‌کند:
echo   - Backend: express, mongoose, axios, ...
echo   - Frontend: react, recharts, framer-motion, ...
echo.

echo --------------------------------------------------
echo [1/3] بررسی Node.js
echo --------------------------------------------------
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [خطا] Node.js نصب نیست!
    echo از https://nodejs.org دانلود و نصب کنید (نسخه 18+)
    pause
    exit /b 1
)
echo [OK] Node.js: 
node -v
echo.

echo --------------------------------------------------
echo [2/3] نصب وابستگی‌های Backend (سرور)
echo        مسیر: server\node_modules
echo --------------------------------------------------
cd /d "%~dp0server"
echo در حال نصب پکیج‌های سرور...
call npm install
if %errorlevel% neq 0 (
    echo [خطا] نصب Backend失敗 شد
    pause
    exit /b 1
)
echo [OK] وابستگی‌های سرور نصب شد
echo.

echo --------------------------------------------------
echo [3/3] نصب وابستگی‌های Frontend (نمایش)
echo        مسیر: client\node_modules
echo        شامل: react, recharts, framer-motion, axios, ...
echo --------------------------------------------------
cd /d "%~dp0client"
echo در حال نصب پکیج‌های کلاینت...
call npm install
if %errorlevel% neq 0 (
    echo [خطا] نصب Frontend失敗 شد
    pause
    exit /b 1
)
echo [OK] وابستگی‌های کلاینت نصب شد

echo.
echo ============================================
echo  نصب با موفقیت کامل شد!
echo.
echo  مرحله بعد: start-all.bat را اجرا کنید
echo ============================================
echo.
pause
