@echo off
cd /d "%~dp0"
title ده نشین - راه‌اندازی سرویس‌ها

echo ============================================
echo      ده نشین | محصولات ارگانیک و طبیعی
echo         راه‌اندازی سرویس‌های فروشگاه
echo ============================================
echo.
echo این فایل به ترتیب راه‌اندازی می‌کند:
echo   1. MongoDB (دیتابیس)
echo   2. Backend (سرور API روی پورت 5000)
echo   3. Frontend (نمایش سایت روی پورت 5173)
echo.

echo --------------------------------------------------
echo [1/3] راه‌اندازی MongoDB (دیتابیس)
echo        ذخیره محصولات، سفارشات، تنظیمات و ...
echo --------------------------------------------------
docker compose up -d mongodb 2>nul
if %errorlevel% neq 0 (
    docker start dehneshin-mongodb 2>nul
    if %errorlevel% neq 0 (
        echo [خطا] MongoDB راه‌اندازی نشد.
        pause
        exit /b 1
    ) else (
        echo [OK] MongoDB در حال اجراست
    )
) else (
    echo [OK] MongoDB با موفقیت شروع شد
)

echo.
echo --------------------------------------------------
echo [2/3] راه‌اندازی Backend (سرور API - پورت 5000)
echo        - API محصولات، سفارشات، کاربران
echo        - پنل مدیریت و تنظیمات سایت
echo        - آمار و تحلیل بازدیدها
echo        - مدیریت پیام‌ها و لاگ فعالیت
echo --------------------------------------------------
start "ده نشین-Backend" /min cmd /c "cd /d server && node index.js"
echo [OK] Backend در حال اجرا روی http://localhost:5000

echo.
echo --------------------------------------------------
echo [3/3] راه‌اندازی Frontend (نمایش سایت - پورت 5173)
echo        - صفحه اصلی و فروشگاه
echo        - جزئیات محصول با انتخاب رنگ و پارچه
echo        - پنل ادمین حرفه‌ای با نمودار و گزارش
echo        - مدیریت SEO و تنظیمات
echo --------------------------------------------------
start "ده نشین-Frontend" /min cmd /c "cd /d client && npx vite --port 5173 --host"
echo [OK] Frontend در حال اجرا روی http://localhost:5173

echo.
echo ============================================
echo    همه سرویس‌ها در حال راه‌اندازی هستند
echo.
echo    سایت:       http://localhost:5173
echo    پنل ادمین:  http://localhost:5173/admin
echo    API:        http://localhost:5000
echo.
echo    برای توقف: bin\stop-all.bat
echo ============================================
echo.
