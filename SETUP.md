# Dairy Farm Management App - Setup Guide

## 🚀 Quick Start

This is a complete full-stack dairy farm cattle management app with React Native frontend and Node.js backend.

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- PostgreSQL database

## 🛠️ Installation & Setup

### 1. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install mobile dependencies
cd ../mobile
npm install

# For iOS (macOS only)
cd ios && pod install && cd ..
```

### 2. Database Setup

#### Option A: Local PostgreSQL

1. Install PostgreSQL locally
2. Create a database named `dairy_farm`
3. Update `backend/.env` with your database credentials

#### Option B: Free PostgreSQL (Recommended)

1. Sign up for [Render.com](https://render.com) (free tier)
2. Create a new PostgreSQL database
3. Copy the database URL to `backend/.env`

### 3. Backend Environment Setup

Create `backend/.env` file:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/dairy_farm"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Server
PORT=3000
NODE_ENV=development

# Firebase (for push notifications)
FIREBASE_PROJECT_ID="your-firebase-project-id"
FIREBASE_PRIVATE_KEY_ID="your-private-key-id"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL="your-service-account-email"
FIREBASE_CLIENT_ID="your-client-id"
```

### 4. Database Migration & Seeding

```bash
cd backend
npx prisma generate
npx prisma db push
# Seed organizations and test data
node src/scripts/seedOrganizations.js
```

### 5. Mobile Environment Setup

Update `mobile/src/config/config.js`:

```javascript
export const API_BASE_URL = "http://localhost:3000/api"; // Change to your backend URL
```

### 6. Organization Setup

The app now supports multiple organizations for multi-tenancy:

- **Test Organization**: For development and testing
- **Customer Organization**: For production customers

Each organization has its own:

- Users (isolated by organization)
- Cattle records
- Semination, pregnancy, feeding, and health records
- Notifications

**Default Login Credentials:**

- Test Organization:
  - Admin: `testadmin` / `admin123`
  - User: `testuser` / `admin123`
- Customer Organization:
  - Admin: `customeradmin` / `admin123`
  - User: `customeruser` / `admin123`

### 7. Firebase Setup (Optional - for push notifications)

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Add Android app to your project
3. Download `google-services.json` and place it in `mobile/android/app/`
4. Update backend `.env` with Firebase service account credentials

## 🚀 Running the App

### Backend

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Start the server
npm run dev
```

The backend will be available at `http://localhost:3000`

### Mobile App

```bash
cd mobile

# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios
```

## 📱 Features

### Admin Features

- Add/Edit/Delete cattle
- Assign cattle to users
- View all cattle and activities
- Manage user accounts

### User Features

- View assigned cattle
- Record semination injections
- Track pregnancy cycles
- Log feeding and health records
- Receive push notifications

### Key Features

- **Dual-layer notifications**: Local scheduled alarms + FCM push notifications
- **Pregnancy tracking**: Automatic 15-day check reminders
- **Calf management**: Track parent-child relationships
- **Health monitoring**: Disease, injection, and checkup records
- **Feeding logs**: Track feed types, quantities, and water
- **Role-based access**: Admin and User permissions
- **Offline-ready**: Works with local notifications

## 🔧 API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Admin creates user
- `GET /api/auth/me` - Get current user

### Organizations

- `POST /api/organizations` - Create organization (Admin only)
- `GET /api/organizations` - Get all organizations (Admin only)
- `GET /api/organizations/:id` - Get organization details (Admin only)
- `PUT /api/organizations/:id` - Update organization (Admin only)
- `DELETE /api/organizations/:id` - Delete organization (Admin only)
- `GET /api/organizations/:id/stats` - Get organization statistics
- `POST /api/auth/register-device` - Register FCM token

### Cattle Management

- `GET /api/cows` - Get cattle list (filtered by role)
- `GET /api/cows/:id` - Get cattle details
- `POST /api/cows` - Add new cattle (Admin only)
- `PUT /api/cows/:id` - Update cattle
- `POST /api/cows/:id/assign` - Assign cattle to user
- `POST /api/cows/:id/photo` - Upload cattle photo

### Semination & Pregnancy

- `POST /api/semination` - Record semination
- `PUT /api/semination/:id/check` - Mark pregnancy check
- `GET /api/semination/cattle/:id` - Get semination history
- `GET /api/pregnancy/cattle/:id` - Get pregnancy records
- `PUT /api/pregnancy/:id/delivery` - Record delivery
- `PUT /api/pregnancy/:id/separation` - Mark separation

### Feeding & Health

- `POST /api/feeding` - Record feeding
- `GET /api/feeding/cattle/:id` - Get feeding history
- `POST /api/health` - Record health event
- `GET /api/health/cattle/:id` - Get health history

### Notifications

- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read

## 🗄️ Database Schema

The app uses PostgreSQL with Prisma ORM. Key models:

- **User**: Admin/User roles with authentication
- **Cattle**: Cattle information with parent-child relationships
- **SeminationRecord**: Semination injections with 15-day check tracking
- **PregnancyRecord**: Pregnancy cycles and calf management
- **FeedingRecord**: Feed and water logging
- **HealthRecord**: Disease, injection, and checkup records
- **Notification**: Push notification management

## 📦 Deployment

**📋 For complete production deployment steps, see [DEPLOYMENT.md](./DEPLOYMENT.md)**

### Quick Summary

- **Backend**: Deploy to Render.com (FREE)
- **Database**: PostgreSQL on Render.com (FREE)
- **Mobile**: Generate APK for Android distribution
- **Cost**: $0/month (completely free)

### Production URLs

After deployment, your app will be available at:

- **Backend API**: `https://your-app-name.onrender.com/api`
- **APK**: Generated locally for distribution

## 🔔 Notification System

The app uses a dual-layer notification system:

1. **Local Notifications (Notifee)**: Scheduled alarms at 10 AM for pregnancy checks
2. **Push Notifications (FCM)**: Real-time notifications for health alerts and reminders

## 🎨 UI/UX Features

- Material Design 3 with React Native Paper
- Farm-themed color palette (Green/Blue)
- Intuitive navigation with bottom tabs
- Role-based screen visibility
- Loading states and error handling
- Empty states with helpful illustrations

## 🐛 Troubleshooting

### Common Issues

1. **Metro bundler issues**: Run `npm start --reset-cache`
2. **Database connection**: Check DATABASE_URL in backend/.env
3. **Push notifications**: Verify Firebase configuration
4. **Android build**: Ensure Android Studio is properly configured

### Getting Help

- Check the console logs for detailed error messages
- Verify all environment variables are set correctly
- Ensure all dependencies are installed properly

## 📄 License

MIT License - see LICENSE file for details

---

**Ready to manage your dairy farm! 🐄✨**
