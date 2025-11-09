# CattleSync - Dairy Farm Management Mobile App

React Native mobile application for comprehensive dairy farm cattle management.

## Features

- **User Authentication**: Secure login with role-based access (Admin/User)
- **Cattle Management**: Complete CRUD operations for cattle records
- **Semination Tracking**: Record semination injections with automatic 15-day check reminders
- **Pregnancy Management**: Track pregnancy cycles, record deliveries, manage calf separation
- **Feeding Records**: Log feed types, quantities, and water intake
- **Health Records**: Track diseases, injections, and checkups
- **Push Notifications**: FCM push notifications + local scheduled alarms
- **Multi-tenant**: Organization-based data isolation
- **Photo Management**: Upload and manage cattle photos

## Prerequisites

- **Node.js** (v18 or higher)
- **React Native CLI**: `npm install -g react-native-cli`
- **Android Studio** (for Android development)
  - Android SDK
  - Android SDK Platform 34
  - Android Virtual Device (AVD)
- **Xcode** (for iOS development, macOS only)
- **JDK 11** or higher
- **CocoaPods** (for iOS): `sudo gem install cocoapods`

## Installation

### 1. Install Dependencies

```bash
cd mobile
npm install
```

### 2. iOS Setup (macOS only)

```bash
cd ios
pod install
cd ..
```

### 3. Environment Configuration

The app is already configured to use the production API:
- **API URL**: `https://cattle-sync.onrender.com/api`

If you need to change it, update `src/config/config.js`:

```javascript
export const API_BASE_URL = "https://cattle-sync.onrender.com/api";
```

### 4. Firebase Setup (Optional - for push notifications)

The app includes placeholder Firebase configuration files. To enable push notifications:

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Add Android app with package name: `com.cattlesync`
3. Download `google-services.json` and place it in `android/app/`
4. Add iOS app with bundle ID: `com.cattlesync`
5. Download `GoogleService-Info.plist` and place it in `ios/CattleSync/`

**Note**: The app will work without Firebase, but push notifications won't function.

## Development

### Start Metro Bundler

```bash
npm start
```

Or with cache reset:
```bash
npm start -- --reset-cache
```

### Run on Android

1. Start an Android emulator or connect a physical device
2. Run:
```bash
npm run android
```

### Run on iOS (macOS only)

1. Start iOS Simulator or connect a physical device
2. Run:
```bash
npm run ios
```

## Testing the App

### Default Login Credentials

**Test Organization:**
- Admin: `testadmin` / `admin123`
- User: `testuser` / `admin123`

**Customer Organization:**
- Admin: `customeradmin` / `admin123`
- User: `customeruser` / `admin123`

### First Steps

1. **Login** with test credentials
2. **View Cattle List** - See all cattle (filtered by role)
3. **Add Cattle** (Admin only) - Create new cattle records
4. **Record Semination** - Track semination injections
5. **Check Pregnancy** - Mark 15-day pregnancy checks
6. **Log Feeding** - Record feed and water
7. **Health Records** - Track diseases, injections, checkups

## Building for Production

### Android APK

```bash
cd android
./gradlew assembleRelease
```

APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

### iOS

1. Open `ios/CattleSync.xcworkspace` in Xcode
2. Select your development team
3. Build and archive for App Store or Ad Hoc distribution

## Project Structure

```
mobile/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── CattleCard.js
│   │   └── TimelineItem.js
│   ├── screens/             # Screen components
│   │   ├── auth/           # Authentication screens
│   │   ├── cattle/         # Cattle management
│   │   ├── semination/     # Semination tracking
│   │   ├── feeding/        # Feeding records
│   │   ├── health/         # Health records
│   │   ├── notifications/  # Notifications
│   │   └── profile/        # User profile
│   ├── navigation/         # Navigation configuration
│   ├── services/           # API services
│   ├── context/            # React Context providers
│   ├── theme/              # App theme configuration
│   └── config/             # App configuration
├── android/                # Android native code
├── ios/                    # iOS native code
├── App.js                  # Root component
└── index.js                # Entry point
```

## Troubleshooting

### Metro Bundler Issues

```bash
npm start -- --reset-cache
```

### Android Build Issues

1. Clean build:
```bash
cd android
./gradlew clean
cd ..
npm run android
```

2. Check Android SDK is properly installed
3. Ensure emulator is running or device is connected

### iOS Build Issues

1. Clean pods:
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

2. Clean Xcode build folder: Product → Clean Build Folder (Cmd+Shift+K)

### Firebase Not Working

- Ensure `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) are in correct locations
- Check Firebase project settings match app package/bundle ID
- Verify Firebase dependencies are installed

### API Connection Issues

- Check `src/config/config.js` has correct API URL
- Verify backend is running at `https://cattle-sync.onrender.com`
- Check network connectivity
- Review Metro bundler logs for API errors

## Key Dependencies

- **React Native**: 0.73.5
- **React Navigation**: Navigation stack and tabs
- **React Native Paper**: Material Design components
- **Axios**: HTTP client for API calls
- **AsyncStorage**: Local data persistence
- **Firebase**: Push notifications
- **Notifee**: Local scheduled notifications
- **React Native Vector Icons**: Icon library

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review console logs in Metro bundler
3. Check React Native and dependency documentation

## License

MIT License
