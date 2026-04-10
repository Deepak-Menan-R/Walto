# Complete Deployment & Go-Live Procedures
## Walto Application

This document provides comprehensive procedures for deploying the Walto application for testing and production environments.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Deployment](#backend-deployment-railwayapp)
3. [Database Setup](#database-setup)
4. [Frontend Deployment](#frontend-deployment)
5. [Testing Procedures](#testing-procedures)
6. [Production Go-Live](#production-go-live)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts & Tools
- [ ] OpenAI API key (from platform.openai.com/api-keys)
- [ ] Railway.app account (or Render.com/AWS)
- [ ] GitHub account (for version control)
- [ ] Expo account (for mobile builds)
- [ ] Node.js 18+ installed
- [ ] PostgreSQL 15+ installed locally
- [ ] Android Studio (for testing)

### Required Environment Variables

**Backend (.env)**
```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@host:5432/dbname
OPENAI_API_KEY=sk-proj-xxx
JWT_SECRET=your-random-secret-here
ALLOWED_ORIGINS=https://your-app.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Frontend (.env)**
```bash
EXPO_PUBLIC_API_URL=https://your-backend-url.railway.app
```

---

## Backend Deployment (Railway.app)

### Step 1: Prepare Backend Code

```powershell
# Navigate to backend directory
cd d:\Project\Walto\walto-backend

# Initialize Git repository
git init
git add .
git commit -m "Initial backend commit"

# Create GitHub repository and push
git remote add origin https://github.com/yourusername/walto-backend.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Railway.app

#### A. Via Railway CLI

```powershell
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Link to GitHub repo (optional)
railway link

# Add PostgreSQL database
railway add --database postgresql

# Deploy
railway up
```

#### B. Via Railway Dashboard

1. Go to [railway.app](https://railway.app)
2. Sign up/Login
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Authorize GitHub and select your repository
6. Railway will auto-detect Node.js project

### Step 3: Configure Environment Variables

In Railway Dashboard:

1. Click on your service → Variables tab
2. Add these variables:
   - `NODE_ENV` = `production`
   - `OPENAI_API_KEY` = `sk-proj-your-key-here`
   - `JWT_SECRET` = `[Generate: openssl rand -base64 32]`
   - `ALLOWED_ORIGINS` = `https://your-domain.com`
   - `RATE_LIMIT_WINDOW_MS` = `900000`
   - `RATE_LIMIT_MAX_REQUESTS` = `100`

3. Railway automatically sets `DATABASE_URL` from PostgreSQL plugin

### Step 4: Configure Build Settings

Create `railway.json` in backend root:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build"
  },
  "deploy": {
    "startCommand": "node dist/index.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Step 5: Verify Deployment

```powershell
# Get your Railway URL (something like: https://walto-production.up.railway.app)

# Test health endpoint
curl https://your-app.railway.app/health

# Expected response:
# {"status":"ok","timestamp":"2026-04-03T...","environment":"production"}
```

---

## Database Setup

### Option 1: Railway PostgreSQL (Recommended)

Railway automatically provisions PostgreSQL. Set it up:

```powershell
# Connect to Railway PostgreSQL
railway run node scripts/setup-database.js
```

### Option 2: Supabase

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Project Settings → Database
4. Update `DATABASE_URL` in Railway
5. Run setup script:

```powershell
# Set DATABASE_URL temporarily
$env:DATABASE_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"

# Run setup
node scripts/setup-database.js
```

### Option 3: AWS RDS

1. Create PostgreSQL instance in AWS RDS
2. Configure security groups to allow Railway IPs
3. Get connection string
4. Update `DATABASE_URL` in Railway
5. Run setup script

### Verify Database Setup

```powershell
# Test database connection
railway run node -e "const pool = require('./dist/config/database').default; pool.query('SELECT NOW()').then(r => console.log(r.rows[0]))"
```

---

## Frontend Deployment

### Step 1: Prepare Frontend Code

```powershell
# Navigate to frontend directory
cd d:\Project\Walto\walto-frontend

# Update .env with production backend URL
echo EXPO_PUBLIC_API_URL=https://your-backend.railway.app > .env

# Initialize Git
git init
git add .
git commit -m "Initial frontend commit"

# Push to GitHub
git remote add origin https://github.com/yourusername/walto-frontend.git
git branch -M main
git push -u origin main
```

### Step 2: Configure EAS Build

```powershell
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure
```

This creates `eas.json`:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### Step 3: Build for Testing (Preview)

```powershell
# Build APK for internal testing
eas build --platform android --profile preview

# Wait for build to complete (10-20 minutes)
# Download APK from provided link
# Share with testers
```

### Step 4: Build for Production

```powershell
# Build production APK
eas build --platform android --profile production

# For Play Store AAB
eas build --platform android --profile production --auto-submit
```

---

## Testing Procedures

### A. Backend Testing

#### 1. Health Check
```powershell
curl https://your-backend.railway.app/health
```

#### 2. User Registration
```powershell
curl -X POST https://your-backend.railway.app/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{"phone": "9876543210", "password": "Test@123", "email": "test@example.com"}'
```

Expected response:
```json
{
  "success": true,
  "user": {"id": "...", "phone": "9876543210", "email": "test@example.com"},
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 3. User Login
```powershell
curl -X POST https://your-backend.railway.app/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"phone": "9876543210", "password": "Test@123"}'
```

#### 4. SMS Parsing (Use token from login)
```powershell
$token = "your-token-here"
curl -X POST https://your-backend.railway.app/api/parse-sms `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $token" `
  -d '{"sms_messages": ["Rs.250 debited via UPI to SWIGGY on 01-Apr-26. Avbl Bal: Rs.15000.50"]}'
```

#### 5. Get Transactions
```powershell
curl https://your-backend.railway.app/api/transactions `
  -H "Authorization: Bearer $token"
```

### B. Frontend Testing

#### 1. Install APK on Android Device
```powershell
# Download APK from EAS build
# Transfer to device
adb install walto.apk
```

#### 2. Test Flow
1. Open app
2. Register new account
3. Login with credentials
4. Grant SMS permission
5. Tap "Sync SMS"
6. Verify transactions appear
7. Check analytics tab
8. Test logout

#### 3. Test Cases Checklist
- [ ] User registration works
- [ ] User login works
- [ ] SMS permission request displays
- [ ] SMS reading works
- [ ] Transaction parsing accurate
- [ ] Dashboard shows correct totals
- [ ] Transaction list displays
- [ ] Analytics shows categories
- [ ] Logout works
- [ ] Offline mode works
- [ ] Data persists after app restart

---

## Production Go-Live

### Pre-Launch Checklist

#### Backend
- [ ] Environment variables configured
- [ ] Database backed up
- [ ] SSL/HTTPS enabled
- [ ] Rate limiting enabled
- [ ] Error monitoring setup (Sentry)
- [ ] Logging configured
- [ ] API documentation ready
- [ ] Load testing completed
- [ ] Security audit done

#### Frontend
- [ ] Production API URL set
- [ ] App icons configured
- [ ] Splash screen ready
- [ ] Analytics integrated
- [ ] Crashlytics setup
- [ ] Privacy policy added
- [ ] Terms of service added
- [ ] App permissions reviewed

### Launch Steps

#### 1. Final Backend Deployment

```powershell
# Tag release
git tag -a v1.0.0 -m "Production release v1.0.0"
git push origin v1.0.0

# Deploy to Railway (auto-deploys on push)
# Or manually trigger
railway up
```

#### 2. Database Migration

```powershell
# Backup existing data
railway run pg_dump $DATABASE_URL > backup.sql

# Run migrations if any
railway run node scripts/setup-database.js
```

#### 3. Final Frontend Build

```powershell
# Build production APK/AAB
eas build --platform android --profile production

# Submit to Play Store (if approved)
eas submit --platform android
```

#### 4. Smoke Testing

After deployment, test critical paths:
- User registration
- Login
- SMS parsing
- Transaction display
- Logout

#### 5. Monitoring Setup

**Add Sentry for Error Tracking:**

```powershell
# Backend
cd walto-backend
npm install @sentry/node
```

In `src/index.ts`:
```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: process.env.NODE_ENV,
});
```

**Frontend:**
```powershell
cd walto-frontend
npx expo install sentry-expo
```

---

## Monitoring & Maintenance

### Daily Checks
- [ ] Check Railway dashboard for errors
- [ ] Monitor Sentry for crashes
- [ ] Check database size
- [ ] Verify API response times

### Weekly Tasks
- [ ] Review user feedback
- [ ] Check analytics
- [ ] Database backup verification
- [ ] Security updates check

### Monthly Tasks
- [ ] Performance review
- [ ] Cost analysis
- [ ] Feature planning
- [ ] Security audit

### Monitoring Tools

**Railway Dashboard:**
- CPU usage
- Memory usage
- Request count
- Error rate

**Sentry:**
- Error tracking
- Performance monitoring
- User feedback

**PostgreSQL:**
```sql
-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check active connections
SELECT count(*) FROM pg_stat_activity;
```

---

## Troubleshooting

### Common Issues

#### 1. Backend Won't Start

**Symptom:** App crashes on Railway
**Solution:**
```powershell
# Check logs
railway logs

# Common issues:
# - Missing environment variables
# - Database connection failed
# - Build errors

# Verify DATABASE_URL is set
railway variables

# Test locally first
npm run dev
```

#### 2. Database Connection Fails

**Symptom:** "Database connection error"
**Solution:**
```powershell
# Test connection
railway run node -e "require('pg').Client({connectionString:process.env.DATABASE_URL}).connect().then(()=>console.log('OK'))"

# Check DATABASE_URL format
# Should be: postgresql://user:pass@host:port/db
```

#### 3. SMS Permission Denied

**Symptom:** Cannot read SMS
**Solution:**
- Check AndroidManifest.xml has permissions
- Request permission at runtime
- Test on physical device (not emulator)

#### 4. API Timeout

**Symptom:** "Request timeout"
**Solution:**
```typescript
// Increase timeout in services/api.ts
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // Increase to 60 seconds
});
```

#### 5. GPT API Rate Limit

**Symptom:** "Rate limit exceeded"
**Solution:**
```typescript
// In aiParser.service.ts, increase delay
await this.sleep(2000); // Increase to 2 seconds between batches
```

---

## Cost Optimization

### Estimated Monthly Costs

| Service | Free Tier | Paid (Production) |
|---------|-----------|-------------------|
| Railway | $5 credit | $10-20 |
| OpenAI GPT | $5 free credit | $20-40 |
| Expo EAS | 30 builds/month | $29 |
| Supabase (if used) | 500MB DB | $25 |
| **Total** | **~$35** | **$60-115** |

### Cost Reduction Tips

1. **Batch SMS Processing:** Process SMS in larger batches to reduce API calls
2. **Use Railway Free Tier:** For testing/small scale
3. **Cache Results:** Store parsed transactions locally
4. **Optimize Database:** Regular cleanup of old data
5. **CDN for Static Assets:** Use Cloudflare for free CDN

---

## Security Best Practices

### Backend Security
- [x] HTTPS only
- [x] JWT authentication
- [x] Password hashing (bcrypt)
- [x] Rate limiting
- [x] SQL injection prevention
- [x] CORS configured
- [ ] Regular security audits
- [ ] Dependency updates

### Frontend Security
- [x] API keys in environment variables
- [x] Secure token storage (AsyncStorage)
- [x] Input validation
- [ ] Certificate pinning
- [ ] Obfuscation for production

### Database Security
- [x] Parameterized queries
- [x] SSL connections
- [x] Unique constraints
- [ ] Regular backups
- [ ] Access logging

---

## Backup & Recovery

### Database Backup

**Automated Backups (Railway):**
- Enabled by default
- 7-day retention
- Point-in-time recovery

**Manual Backup:**
```powershell
# Backup database
railway run pg_dump $DATABASE_URL > backup_$(Get-Date -Format "yyyyMMdd").sql

# Restore database
railway run psql $DATABASE_URL < backup_20260403.sql
```

### Code Backup
- Git repository on GitHub
- Tags for releases
- Branch protection enabled

---

## Support & Documentation

### User Documentation
- [ ] Create user manual
- [ ] FAQs prepared
- [ ] Video tutorials
- [ ] In-app help

### Developer Documentation
- [x] API documentation
- [x] Architecture diagram
- [x] Setup guide
- [x] Deployment guide

### Support Channels
- GitHub Issues
- Email support
- In-app feedback

---

## Go-Live Announcement

### Announcement Template

**Subject:** Walto App - Now Live!

**Body:**
We're excited to announce the launch of Walto!

**Features:**
✅ Automatic SMS parsing
✅ Smart categorization
✅ Monthly spending insights
✅ Secure & private

**Download:** [APK Link]

**Getting Started:**
1. Download and install APK
2. Register with phone number
3. Grant SMS permission
4. Tap "Sync SMS"
5. View your financial insights!

**Support:** support@yourapp.com

---

## Post-Launch Checklist

### Week 1
- [ ] Monitor error rates
- [ ] Collect user feedback
- [ ] Fix critical bugs
- [ ] Update documentation

### Week 2-4
- [ ] Analyze usage patterns
- [ ] Optimize performance
- [ ] Plan v1.1 features
- [ ] Marketing activities

### Month 2+
- [ ] Feature expansion
- [ ] Play Store submission
- [ ] User growth strategies
- [ ] Revenue model (if applicable)

---

## Environment-Specific Commands

### Development
```powershell
# Backend
cd transaction-parser-backend
npm run dev

# Frontend
cd transaction-parser
npx expo start
```

### Testing
```powershell
# Backend - use test database
$env:DATABASE_URL="postgresql://localhost:5432/test_db"
npm run dev

# Frontend - use test backend
$env:EXPO_PUBLIC_API_URL="http://localhost:3000"
npx expo start
```

### Production
```powershell
# Backend
railway up

# Frontend
eas build --platform android --profile production
```

---

## Success Metrics

Track these KPIs:
- Active users
- Transactions parsed
- API response times
- Error rates
- User retention
- App crashes

---

## Next Steps & Future Enhancements

1. **iOS Version**
2. **Web Dashboard**
3. **Budget Planning**
4. **Bill Reminders**
5. **Export to Excel**
6. **Subscription Management**
7. **Investment Tracking**
8. **Multi-user Support**

---

**Document Version:** 1.0  
**Last Updated:** April 3, 2026  
**Maintained By:** Development Team

---

## Quick Reference Commands

```powershell
# Deploy backend
cd walto-backend
railway up

# Build frontend
cd walto-frontend
eas build --platform android --profile preview

# Check logs
railway logs

# Database backup
railway run pg_dump $DATABASE_URL > backup.sql

# Test API
curl https://your-app.railway.app/health
```

---

**🎉 Congratulations! Your Walto app is now live!**
