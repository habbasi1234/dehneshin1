# ده نشین — Deh Neshin

پلتفرم فروشگاهی مبلمان لوکس با قابلیت چندزبانه (فارسی، انگلیسی، عربی)

## پیش‌نیازها

- Node.js 18+
- npm

## نصب و اجرا

```bash
# نصب وابستگی‌های سرور
cd server
npm install

# نصب وابستگی‌های کلاینت
cd ../client
npm install
```

### اجرای سرور (پورت 5000)

```bash
cd server
npm run dev
```

### اجرای کلاینت (پورت 3000)

```bash
cd client
npm run dev
```

سایت در `http://localhost:3000` در دسترس خواهد بود.

## پنل مدیریت

**آدرس:** `/admin/login`
**نام کاربری:** `admin`
**رمز عبور:** `dehneshin@1404`

ورود دو مرحله‌ای با کد OTP (در صورت فعال بودن در تنظیمات).

## ساختار پروژه

```
mobl/
├── client/          # برنامه React (Vite)
│   └── src/
│       ├── components/   # کامپوننت‌های عمومی
│       ├── context/      # کانتکست (زبان، تم)
│       ├── pages/        # صفحات
│       │   └── admin/    # پنل مدیریت
│       └── App.jsx       # روتینگ
├── server/          # سرور Express
│   ├── routes/      # مسیرهای API
│   ├── data/        # دیتای JSON
│   └── index.js     # نقطه ورود
└── README.md
```

## APIهای SMS (sms.ir)

| متد | مسیر | توضیح |
|------|------|-------|
| POST | `/api/auth/admin/send-otp` | ارسال OTP (ورود ادمین) |
| POST | `/api/auth/send-otp` | ارسال OTP (باشگاه مشتریان) |
| GET | `/api/auth/sms/credit` | موجودی اعتبار |
| GET | `/api/auth/sms/lines` | لیست خطوط |
| GET | `/api/auth/sms/status/:id` | وضعیت ارسال |
| GET | `/api/auth/sms/log` | لاگ پیامک‌ها |

## تکنولوژی‌ها

- **کلاینت:** React 18, Vite, react-leaflet, framer-motion
- **سرور:** Express, multer, nodemailer
- ** SMS:** sms.ir API (verify/bulk)
