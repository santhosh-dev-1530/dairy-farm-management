# Dairy Farm Mobile App

React Native mobile application for the Dairy Farm Management System.

## Features

- User authentication (login/register)
- Cow management and tracking
- Milk production monitoring
- Health records
- Feeding schedules
- Offline capability
- Real-time notifications
- QR code scanning for cow identification
- Photo capture for health records
- GPS location tracking

## Prerequisites

- Node.js (v18 or higher)
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- JDK 11 or higher

## Installation

1. Install dependencies:
```bash
npm install
```

2. For iOS, install pods:
```bash
npm run pod-install
```

3. Create environment file:
```bash
cp env.example .env
```

4. Update `.env` with your configuration:
```
API_BASE_URL=http://localhost:3000/api
```

## Development

### Start Metro bundler:
```bash
npm start
```

### Run on Android:
```bash
npm run android
```

### Run on iOS:
```bash
npm run ios
```

## Project Structure

```
mobile/
├── src/
│   ├── components/     # Reusable components
│   ├── screens/        # Screen components
│   ├── navigation/     # Navigation configuration
│   ├── services/       # API services
│   ├── utils/          # Utility functions
│   ├── hooks/          # Custom hooks
│   ├── constants/      # App constants
│   └── assets/         # Images, fonts, etc.
├── android/            # Android specific files
├── ios/               # iOS specific files
└── index.js           # Entry point
```

## Building

### Android APK:
```bash
cd android && ./gradlew assembleRelease
```

### iOS:
Open `ios/DairyFarm.xcworkspace` in Xcode and build.

## Testing

```bash
npm test
```

## Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation as needed 