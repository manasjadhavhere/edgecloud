# EdgeCloud — Firebase Setup Guide

## Overview
EdgeCloud needs a free Firebase Realtime Database to sync game state between the host and participants in real-time. This takes about **2 minutes**.

---

## Step 1: Create a Firebase Project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Create a project"**
3. Name it: `edgecloud` (or anything you like)
4. Disable Google Analytics (optional, not needed)
5. Click **Create project**

---

## Step 2: Enable Realtime Database

1. In the left sidebar, click **Build → Realtime Database**
2. Click **"Create Database"**
3. Choose a location (e.g. `asia-south1` for India)
4. When asked for security rules, select **"Start in test mode"**
   > ⚠️ Test mode allows anyone to read/write. Fine for a one-time event — you can lock it down after.
5. Click **Enable**

---

## Step 3: Get your Firebase Config

1. Go to **Project Settings** (gear icon ⚙️ next to "Project Overview")
2. Scroll down to **"Your apps"** → click the **`</>`** (Web) icon to add a web app
3. Give it a nickname: `edgecloud-web`
4. Click **Register app**
5. You'll see a `firebaseConfig` object like:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "edgecloud-xxxxx.firebaseapp.com",
  databaseURL: "https://edgecloud-xxxxx-default-rtdb.asia-south1.firebasedatabase.app",
  projectId: "edgecloud-xxxxx",
  storageBucket: "edgecloud-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

---

## Step 4: Update `src/firebase.js`

Open `src/firebase.js` and replace the placeholder values with your real config:

```js
const firebaseConfig = {
  apiKey: "YOUR REAL VALUE HERE",
  authDomain: "YOUR REAL VALUE HERE",
  databaseURL: "YOUR REAL VALUE HERE",   // ← most important
  projectId: "YOUR REAL VALUE HERE",
  storageBucket: "YOUR REAL VALUE HERE",
  messagingSenderId: "YOUR REAL VALUE HERE",
  appId: "YOUR REAL VALUE HERE",
};
```

---

## Step 5: Test Locally

```bash
npm run dev
```

Open `http://localhost:5173` and try creating a game. If the QR appears, Firebase is connected! ✅

---

## Step 6: Deploy to Vercel

```bash
# Install Vercel CLI (one-time)
npm install -g vercel

# Deploy
vercel

# Follow the prompts — select the EdgeCloud folder
# For "Override build command?" → No
# For "Override output directory?" → No (Vite outputs to dist/)
```

After deployment, Vercel gives you a URL like:
`https://edge-cloud-game.vercel.app`

The QR code on the host screen will **automatically** encode this URL — no changes needed.

---

## Firebase Security Rules (Optional, post-event hardening)

After your event, you can lock the database in Firebase Console → Realtime Database → Rules:

```json
{
  "rules": {
    ".read": false,
    ".write": false,
    "games": {
      "$gameId": {
        ".read": true,
        "responses": {
          ".write": true
        }
      }
    },
    "activeGame": {
      ".read": true,
      ".write": "auth != null"
    }
  }
}
```

---

## That's it! 🎉

Your EdgeCloud app is fully ready. The free Firebase Spark plan gives you:
- **1 GB** database storage
- **10 GB/month** data transfer
- **100 simultaneous connections**

More than enough for any conference session!
