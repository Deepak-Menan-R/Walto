# Quick Start Guide - Walto

This guide will get you up and running in 15 minutes.

---

## Prerequisites

- Node.js 18+ installed
- PostgreSQL installed
- OpenAI API key
- Android device or emulator

---

## Part 1: Backend Setup (5 minutes)

### 1. Install Dependencies

```powershell
cd d:\Project\Walto\walto-backend
npm install
```

### 2. Configure Environment

```powershell
# Copy example env file
copy .env.example .env

# Edit .env and add:
# - Your OpenAI API key
# - PostgreSQL connection string
# - JWT secret (generate with: openssl rand -base64 32)
```

### 3. Setup Database

```powershell
# Create database
createdb walto_db

# Run setup script
node scripts/setup-database.js
```

### 4. Start Backend

```powershell
npm run dev
```

Test: Open http://localhost:3000/health

---

## Part 2: Frontend Setup (5 minutes)

### 1. Install Dependencies

```powershell
cd d:\Project\Walto\walto-frontend
npm install
```

### 2. Configure Environment

```powershell
# Copy example env file
copy .env.example .env

# Edit .env:
# EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_IP:3000
# Find your IP: ipconfig (look for IPv4 Address)
```

### 3. Start Frontend

```powershell
npx expo start
```

### 4. Run on Android

- Press `a` to open on Android emulator
- Or scan QR code with Expo Go app on physical device

---

## Part 3: Test the App (5 minutes)

### 1. Register Account
- Open app
- Tap "Register"
- Enter phone: `9876543210`
- Enter password: `Test@123`
- Tap Register

### 2. Test SMS Parsing
- Grant SMS permission
- Tap "Sync SMS" button
- Wait for processing
- View parsed transactions

### 3. Explore Features
- Dashboard: Monthly spending
- Transactions: Full list
- Analytics: Category breakdown
- Settings: Account info

---

## Troubleshooting

### Backend won't start
```powershell
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill process
taskkill /PID <PID> /F
```

### Frontend can't connect
- Use your computer's IP, not `localhost`
- Ensure backend is running
- Check firewall settings

### Database errors
```powershell
# Reset database
dropdb walto_db
createdb walto_db
node scripts/setup-database.js
```

---

## Next Steps

- Read [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
- Customize categories and features
- Build production APK with EAS

---

## Test API Manually

```powershell
# Register user
curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d '{"phone":"9876543210","password":"Test@123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"phone":"9876543210","password":"Test@123"}'

# Parse SMS (replace TOKEN)
curl -X POST http://localhost:3000/api/parse-sms -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d '{"sms_messages":["Rs.250 debited via UPI to SWIGGY"]}'
```

---

**Ready to deploy? See [DEPLOYMENT.md](DEPLOYMENT.md)**
