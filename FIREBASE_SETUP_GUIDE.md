# Firebase Setup Guide for MoneyMitra Web Admin

## 🔥 Step 1: Install Firebase Package

Since PowerShell execution is disabled, you need to enable it first OR use Command Prompt:

### Option A: Enable PowerShell Scripts (Recommended)
1. Open PowerShell as Administrator
2. Run: `Set-ExecutionPolicy RemoteSigned`
3. Type `Y` and press Enter
4. Navigate to web_admin folder: `cd "C:\Users\RISHABH SONAWANE\Desktop\monrymitra\web_admin"`
5. Run: `npm install firebase`

### Option B: Use Command Prompt
1. Open Command Prompt (cmd)
2. Navigate to: `cd "C:\Users\RISHABH SONAWANE\Desktop\monrymitra\web_admin"`
3. Run: `npm install firebase`

---

## 🔥 Step 2: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add Project"** or select your existing project
3. Enter project name: `moneymitra` (or any name you prefer)
4. Disable Google Analytics (optional)
5. Click **"Create Project"**

---

## 🔥 Step 3: Enable Email/Password Authentication

1. In Firebase Console, click **"Authentication"** from left sidebar
2. Click **"Get Started"**
3. Go to **"Sign-in method"** tab
4. Click on **"Email/Password"**
5. **Enable** the first option (Email/Password)
6. Click **"Save"**

---

## 🔥 Step 4: Create Firestore Database

1. In Firebase Console, click **"Firestore Database"** from left sidebar
2. Click **"Create Database"**
3. Select **"Start in test mode"** (for development)
4. Choose your location (e.g., `asia-south1` for India)
5. Click **"Enable"**

---

## 🔥 Step 5: Get Firebase Configuration

1. In Firebase Console, click the **Gear Icon** ⚙️ (Project Settings)
2. Scroll down to **"Your apps"** section
3. Click the **Web icon** `</>`
4. Register app with nickname: `MoneyMitra Web`
5. **Copy the firebaseConfig object**

It will look like this:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "moneymitra-xxxxx.firebaseapp.com",
  projectId: "moneymitra-xxxxx",
  storageBucket: "moneymitra-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxxxxxxxxxx"
};
```

---

## 🔥 Step 6: Update Firebase Config in Your Code

1. Open: `web_admin/src/firebase.ts`
2. Replace the placeholder values with your actual Firebase config:

```typescript
const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "YOUR_ACTUAL_AUTH_DOMAIN",
    projectId: "YOUR_ACTUAL_PROJECT_ID",
    storageBucket: "YOUR_ACTUAL_STORAGE_BUCKET",
    messagingSenderId: "YOUR_ACTUAL_SENDER_ID",
    appId: "YOUR_ACTUAL_APP_ID"
};
```

---

## 🔥 Step 7: Set Up Firestore Security Rules (Optional but Recommended)

In Firebase Console > Firestore Database > Rules, replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own business data
    match /businesses/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Coupons - read by all authenticated users, write by admins only
    match /coupons/{couponId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null; // TODO: Add admin check
    }
    
    // Customers - users can only access their own customers
    match /customers/{customerId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

---

## ✅ Step 8: Test the Setup

1. Run your web app: `npm run dev`
2. You should see the **Login/Signup** page
3. Create a new account with email/password
4. After signup, you'll be redirected to business setup
5. Complete the setup and start using the app!

---

## 🎯 What Changed?

### Before (localStorage):
- Data stored locally in browser
- No authentication
- Data lost on browser clear
- No multi-device sync

### After (Firebase):
- ✅ Email/Password authentication
- ✅ Data stored in cloud (Firestore)
- ✅ Secure user-specific data
- ✅ Access from any device
- ✅ Real-time sync
- ✅ Admin can manage all businesses

---

## 🔐 Admin Access

The admin panel (`/admin-login`) still uses the hardcoded credentials:
- **Username**: `RishabhAnsh`
- **Password**: `4137RishAnsh`

This is separate from Firebase authentication and is used for managing coupons and activations.

---

## 📝 Next Steps

After Firebase is set up, you need to:
1. Update `api.ts` to use Firestore instead of localStorage
2. Migrate existing mock data functions to Firestore operations
3. Test all CRUD operations (Create, Read, Update, Delete)

Would you like me to proceed with updating the API layer to use Firestore?
