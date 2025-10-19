# 🚀 Production Deployment Checklist

## Pre-Deployment Setup

### ✅ 1. Database Setup (Render.com)

- [ ] Create Render.com account
- [ ] Create PostgreSQL database (FREE tier)
- [ ] Copy database URL
- [ ] Update `backend/.env` with database URL

### ✅ 2. Backend Preparation

- [ ] Push code to GitHub repository
- [ ] Update `backend/.env` with production values
- [ ] Test database connection locally
- [ ] Run migrations: `npx prisma db push`
- [ ] Seed data: `node src/scripts/production-setup.js`

## Server Deployment (Render.com)

### ✅ 3. Create Web Service

- [ ] Go to Render Dashboard
- [ ] Click "New +" → "Web Service"
- [ ] Connect GitHub repository
- [ ] Set build command: `npm install && npx prisma generate`
- [ ] Set start command: `npm start`

### ✅ 4. Environment Variables

Set these in Render dashboard:

- [ ] `DATABASE_URL` (from step 1)
- [ ] `JWT_SECRET` (strong secret key)
- [ ] `NODE_ENV=production`
- [ ] `PORT=3000`
- [ ] Firebase credentials (if using notifications)

### ✅ 5. Deploy & Test

- [ ] Click "Create Web Service"
- [ ] Wait for deployment to complete
- [ ] Test API: `https://your-app-name.onrender.com/api/health-check`
- [ ] Test login: `POST https://your-app-name.onrender.com/api/auth/login`

## Mobile App APK Generation

### ✅ 6. Update Mobile Configuration

- [ ] Update `mobile/src/config/config.js` with production URL
- [ ] Test API connection from mobile app

### ✅ 7. Generate APK

```bash
cd mobile/android
./gradlew assembleRelease
```

### ✅ 8. Test APK

- [ ] Install APK on Android device
- [ ] Test login with both organizations
- [ ] Test all features (cattle, semination, notifications)
- [ ] Verify push notifications work

## Client Distribution

### ✅ 9. Prepare for Clients

- [ ] APK file: `mobile/android/app/build/outputs/apk/release/app-release.apk`
- [ ] Client login credentials ready
- [ ] Installation instructions prepared

### ✅ 10. Client Credentials

**Customer Organization:**

- Admin: `customeradmin` / `admin123`
- User: `customeruser` / `admin123`

## Production URLs

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
```

## Cost Summary

- **Render.com**: FREE (750 hours/month)
- **PostgreSQL**: FREE (1GB storage)
- **Firebase**: FREE (push notifications)
- **Total**: $0/month

## Troubleshooting

### Common Issues

- [ ] Server not starting → Check environment variables
- [ ] Database connection failed → Verify DATABASE_URL
- [ ] APK not working → Check API_BASE_URL in mobile config
- [ ] Push notifications not working → Verify Firebase setup

### Testing Commands

```bash
# Test database connection
npx prisma studio

# Test API endpoints
curl https://your-app-name.onrender.com/api/health-check

# Test login
curl -X POST https://your-app-name.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testadmin","password":"admin123"}'
```

## Success! 🎉

Once all steps are complete, you'll have:

- ✅ Production server running 24/7
- ✅ PostgreSQL database with your data
- ✅ Android APK ready for distribution
- ✅ Push notifications working
- ✅ Multi-tenant organizations
- ✅ Zero monthly cost

Your clients can now install the APK and manage their dairy farm! 🐄✨
