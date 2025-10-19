# 🚀 Production Deployment Guide

## 📋 Overview

This guide covers complete production deployment for your dairy farm management app:

- **Backend Server**: Deployed on Render.com (FREE)
- **Database**: PostgreSQL on Render.com (FREE)
- **Mobile App**: Generate APK for Android distribution
- **Domain**: Your app will have a public URL like `https://your-app-name.onrender.com`

## 🗄️ Database Setup (FREE - Render.com)

### Step 1: Create PostgreSQL Database

1. **Sign up at [Render.com](https://render.com)** (completely free)
2. **Create New Database**:
   - Click "New +" → "PostgreSQL"
   - Name: `dairy-farm-db`
   - Plan: **Free** (1GB storage, 1GB RAM)
   - Region: Choose closest to your users
3. **Copy Database URL** (you'll need this later):
   ```
   postgresql://username:password@hostname:port/database_name
   ```

### Step 2: Database Migration

```bash
# In your backend folder
cd backend

# Update .env with your Render database URL
echo 'DATABASE_URL="postgresql://username:password@hostname:port/database_name"' >> .env

# Run migrations
npx prisma generate
npx prisma db push

# Seed with organizations
node src/scripts/seedOrganizations.js
```

## 🖥️ Backend Server Deployment (FREE - Render.com)

### Step 1: Prepare Your Repository

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for production deployment"
   git push origin main
   ```

### Step 2: Deploy to Render.com

1. **Create Web Service**:

   - Go to Render Dashboard
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Choose your repository

2. **Configure Build Settings**:

   ```
   Build Command: npm install && npx prisma generate
   Start Command: npm start
   ```

3. **Set Environment Variables** in Render Dashboard:

   ```
   DATABASE_URL=postgresql://username:password@hostname:port/database_name
   JWT_SECRET=your-super-secret-jwt-key-for-production
   NODE_ENV=production
   PORT=3000
   FIREBASE_PROJECT_ID=your-firebase-project-id
   FIREBASE_PRIVATE_KEY_ID=your-private-key-id
   FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----\n
   FIREBASE_CLIENT_EMAIL=your-service-account-email
   FIREBASE_CLIENT_ID=your-client-id
   ```

4. **Deploy**: Click "Create Web Service"

### Step 3: Get Your Production URL

After deployment, you'll get a URL like:

```
https://dairy-farm-backend.onrender.com
```

**Your API endpoints will be**:

```
https://dairy-farm-backend.onrender.com/api/auth/login
https://dairy-farm-backend.onrender.com/api/cows
https://dairy-farm-backend.onrender.com/api/semination
# ... etc
```

## 📱 Mobile App APK Generation

### Step 1: Update Mobile Configuration

Update `mobile/src/config/config.js`:

```javascript
// For production
export const API_BASE_URL = "https://dairy-farm-backend.onrender.com/api";

// For development (comment out in production)
// export const API_BASE_URL = "http://localhost:3000/api";
```

### Step 2: Generate Signed APK

```bash
cd mobile

# For Android
cd android
./gradlew assembleRelease

# APK will be generated at:
# android/app/build/outputs/apk/release/app-release.apk
```

### Step 3: Test APK

1. **Install APK on Android device**:

   ```bash
   adb install android/app/build/outputs/apk/release/app-release.apk
   ```

2. **Test with production server**:
   - Login with test credentials
   - Verify all features work
   - Test push notifications

## 🔧 Production Environment Variables

### Backend (.env for local development)

```env
DATABASE_URL="postgresql://username:password@hostname:port/database_name"
JWT_SECRET="your-super-secret-jwt-key"
NODE_ENV="production"
PORT=3000
FIREBASE_PROJECT_ID="your-firebase-project-id"
FIREBASE_PRIVATE_KEY_ID="your-private-key-id"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL="your-service-account-email"
FIREBASE_CLIENT_ID="your-client-id"
```

### Mobile (config.js)

```javascript
export const API_BASE_URL = "https://your-app-name.onrender.com/api";
```

## 🌐 Production URLs & Endpoints

### Your Production Server

```
Base URL: https://your-app-name.onrender.com
API Base: https://your-app-name.onrender.com/api
```

### Key Endpoints

```
POST https://your-app-name.onrender.com/api/auth/login
GET  https://your-app-name.onrender.com/api/cows
POST https://your-app-name.onrender.com/api/semination
GET  https://your-app-name.onrender.com/api/notifications
# ... all other endpoints
```

## 📦 Complete Deployment Checklist

### ✅ Backend Deployment

- [ ] Create Render.com account
- [ ] Create PostgreSQL database on Render
- [ ] Push code to GitHub
- [ ] Create Web Service on Render
- [ ] Set environment variables
- [ ] Deploy and get production URL
- [ ] Test API endpoints

### ✅ Database Setup

- [ ] Run Prisma migrations
- [ ] Seed organizations and test data
- [ ] Verify data isolation between organizations

### ✅ Mobile App

- [ ] Update API_BASE_URL to production
- [ ] Generate signed APK
- [ ] Test APK with production server
- [ ] Verify push notifications work

### ✅ Testing

- [ ] Test login with both organizations
- [ ] Test cattle management features
- [ ] Test semination and pregnancy tracking
- [ ] Test push notifications
- [ ] Test offline functionality

## 🎯 Client Distribution

### For Your Clients

1. **Generate APK**:

   ```bash
   cd mobile/android
   ./gradlew assembleRelease
   ```

2. **Distribute APK**:

   - Send APK file to client
   - Client installs on Android device
   - Client logs in with their organization credentials

3. **Client Login Credentials**:
   - **Customer Organization**:
     - Admin: `customeradmin` / `admin123`
     - User: `customeruser` / `admin123`

### For Testing

1. **Test Organization**:
   - Admin: `testadmin` / `admin123`
   - User: `testuser` / `admin123`

## 💰 Cost Breakdown (100% FREE)

- **Render.com**: 750 hours/month FREE
- **PostgreSQL**: 1GB storage FREE
- **Firebase**: Push notifications FREE
- **GitHub**: Repository hosting FREE
- **Total Cost**: $0/month

## 🔒 Security Considerations

1. **Change default passwords** in production
2. **Use strong JWT_SECRET**
3. **Enable HTTPS** (automatic on Render)
4. **Regular database backups**
5. **Monitor usage** (Render free tier limits)

## 📊 Monitoring & Maintenance

### Render Dashboard

- Monitor server uptime
- Check database usage
- View logs and errors

### Database Management

```bash
# Connect to production database
npx prisma studio
```

### Server Logs

- View logs in Render dashboard
- Monitor API usage
- Check error rates

## 🚨 Troubleshooting

### Common Issues

1. **Server not starting**:

   - Check environment variables
   - Verify database connection
   - Check build logs

2. **Database connection failed**:

   - Verify DATABASE_URL
   - Check database status in Render
   - Run migrations again

3. **APK not working**:
   - Verify API_BASE_URL is correct
   - Check server is running
   - Test with Postman first

### Getting Help

1. **Check Render logs** in dashboard
2. **Test API endpoints** with Postman
3. **Verify environment variables** are set correctly
4. **Check database connectivity**

## 🎉 Success!

Once deployed, you'll have:

✅ **Production server** running 24/7
✅ **PostgreSQL database** with your data
✅ **Android APK** ready for distribution
✅ **Push notifications** working
✅ **Multi-tenant** organizations
✅ **Zero monthly cost**

Your clients can now:

- Install the APK on their Android devices
- Login with their organization credentials
- Manage their dairy farm cattle
- Receive automated reminders
- Track pregnancy cycles
- Log feeding and health records

**Your production URL will be**: `https://your-app-name.onrender.com`
**APK location**: `mobile/android/app/build/outputs/apk/release/app-release.apk`

---

**Ready to deploy your dairy farm management app! 🐄✨**
