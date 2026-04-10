# Walto Mobile App

Financial transaction parser Android app using React Native Expo.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Update EXPO_PUBLIC_API_URL with your backend URL
```

### 3. Start Development Server
```bash
npx expo start
```

### 4. Run on Android
- Press `a` to open on Android emulator
- Or scan QR code with Expo Go app

## Building for Production

### Install EAS CLI
```bash
npm install -g eas-cli
```

### Configure EAS
```bash
eas build:configure
```

### Build APK for Testing
```bash
eas build --platform android --profile preview
```

### Build for Production
```bash
eas build --platform android --profile production
```

## Features

- SMS reading and parsing
- Transaction categorization
- Monthly spending analytics
- Offline-first with SQLite
- Sync with backend

## Tech Stack

- React Native with Expo
- TypeScript
- Zustand (state management)
- expo-sqlite (local database)
- React Native Paper (UI)
- Axios (API calls)
