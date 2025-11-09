# CattleSync - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Install Dependencies

```bash
cd mobile
npm install
```

### Step 2: Start Metro Bundler

```bash
npm start
```

### Step 3: Run the App

**For Android:**
```bash
npm run android
```

**For iOS (macOS only):**
```bash
cd ios && pod install && cd ..
npm run ios
```

## ✅ That's It!

The app will:
- Connect to production API at `https://cattle-sync.onrender.com/api`
- Show login screen
- Allow you to test all features

## 🔑 Test Login Credentials

**Test Organization:**
- Username: `testadmin`
- Password: `admin123`

**Customer Organization:**
- Username: `customeradmin`
- Password: `admin123`

## 📱 What You Can Do

1. **Login** with test credentials
2. **View Cattle** - See all cattle in your organization
3. **Add Cattle** (Admin only) - Create new cattle records
4. **Record Semination** - Track semination injections
5. **Check Pregnancy** - Mark 15-day pregnancy checks
6. **Log Feeding** - Record feed and water intake
7. **Health Records** - Track diseases, injections, checkups
8. **View Notifications** - See all app notifications

## 🐛 Troubleshooting

**Metro bundler won't start?**
```bash
npm start -- --reset-cache
```

**Android build fails?**
```bash
cd android
./gradlew clean
cd ..
npm run android
```

**iOS build fails?**
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
npm run ios
```

## 📚 Need More Help?

See `README.md` for detailed documentation.

