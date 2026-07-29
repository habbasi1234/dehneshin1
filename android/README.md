# برنامه اندروید ده نشین

## پیش‌نیازها
- Java 17+
- Android Studio (یا Android SDK + Gradle)

## روش 1: با Android Studio
1. File > Open > انتخاب پوشه `android/`
2. Sync with Gradle Files
3. Run > Build Bundle(s) / APK(s) > Build APK(s)

## روش 2: خط فرمان
```bash
# نصب Gradle اگر ندارید:
# winget install Gradle

# Generate wrapper (یکبار)
gradle wrapper --gradle-version 8.5

# Build APK
cd android
.\gradlew.bat assembleRelease
```

APK خروجی در: `android/app/build/outputs/apk/release/app-release.apk`
