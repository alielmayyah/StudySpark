# Firebase Setup Guide for StudySpark

## 🎉 Firebase Integration Complete!

Your StudySpark app is now fully integrated with Firebase for authentication and database functionality.

## 📋 What's Been Set Up

### 1. **Firebase Configuration** ✅
- Location: `src/firebase/config.ts`
- Your Firebase project: `study-spark-b16c8`
- Region: `europe-west1` (Belgium)
- Services: Authentication, Firestore Database

### 2. **Authentication Services** ✅
- Location: `src/firebase/auth.ts`
- Features implemented:
  - ✅ Email/Password registration and login
  - ✅ Google Sign-In
  - ✅ Password reset
  - ✅ User session management
  - ✅ Role-based access (Parent/Student)

### 3. **Firestore Database Services** ✅
- Location: `src/firebase/firestore.ts`
- Features implemented:
  - ✅ Children management (add, view, update, delete)
  - ✅ Access code system for student login
  - ✅ Chat messaging between parent and students
  - ✅ Real-time message listeners
  - ✅ Subscription management

### 4. **TypeScript Types** ✅
- Location: `src/types/index.ts`
- Defined types:
  - User, Parent, Student
  - Child
  - ChatMessage
  - Subscription

### 5. **Updated Pages** ✅
- **Login Page**: Now uses Firebase authentication with Google Sign-In
- **Register Page**: Creates Firebase accounts and first child
- **AddChild Page**: Stores children in Firestore
- **MyChildren Page**: Fetches children from Firestore with access codes

### 6. **Auth Context** ✅
- Location: `src/contexts/AuthContext.tsx`
- Provides global authentication state

---

## 🚀 How to Use Firebase in Your App

### Authentication

```typescript
import { loginWithEmail, registerWithEmail, loginWithGoogle, logout } from '../firebase/auth';

// Email login
const user = await loginWithEmail('email@example.com', 'password');

// Email registration
const user = await registerWithEmail('email@example.com', 'password', 'parent', 'John Doe');

// Google login
const user = await loginWithGoogle();

// Logout
await logout();
```

### Children Management

```typescript
import { addChild, getChildren, updateChild, deleteChild } from '../firebase/firestore';

// Add a new child
const child = await addChild(parentUserId, {
  name: 'Sarah',
  age: 10,
  grade: 'Grade 5'
});

// Get all children for a parent
const children = await getChildren(parentUserId);

// Update a child
await updateChild(childId, { age: 11, grade: 'Grade 6' });

// Delete a child
await deleteChild(childId, parentUserId);
```

### Chat Messages

```typescript
import { sendMessage, getMessages, listenToMessages } from '../firebase/firestore';

// Send a message
await sendMessage({
  senderId: userId,
  senderRole: 'parent',
  receiverId: childUserId,
  message: 'How was school today?',
  parentId: parentUserId,
  childId: childId
});

// Get messages
const messages = await getMessages(parentId, childId);

// Listen to real-time messages
const unsubscribe = listenToMessages(parentId, childId, (messages) => {
  console.log('New messages:', messages);
});

// Stop listening
unsubscribe();
```

---

## 🔐 Security Rules

### ⚠️ IMPORTANT: Test Mode Expires March 24, 2026

Your database is currently in **test mode** for development. Before launch:

1. **Apply Production Rules**: See `FIREBASE_SECURITY_RULES.md`
2. **Go to Firebase Console**: [console.firebase.google.com](https://console.firebase.google.com)
3. **Navigate to**: Firestore Database → Rules
4. **Copy and paste** the production rules from `FIREBASE_SECURITY_RULES.md`
5. **Click "Publish"**

---

## 📊 Database Structure

```
firestore/
├── users/
│   └── {userId}
│       ├── uid: string
│       ├── email: string
│       ├── displayName: string
│       ├── role: 'parent' | 'student'
│       ├── subscriptionStatus: 'free' | 'premium' | 'trial'
│       ├── childrenIds: string[]
│       ├── createdAt: timestamp
│       └── updatedAt: timestamp
│
├── children/
│   └── {childId}
│       ├── id: string
│       ├── parentId: string
│       ├── name: string
│       ├── age: number
│       ├── grade: string
│       ├── accessCode: string (6 chars, uppercase)
│       ├── createdAt: timestamp
│       └── updatedAt: timestamp
│
├── messages/
│   └── {messageId}
│       ├── id: string
│       ├── senderId: string
│       ├── senderRole: 'parent' | 'student'
│       ├── receiverId: string
│       ├── message: string
│       ├── timestamp: timestamp
│       ├── read: boolean
│       ├── parentId: string
│       └── childId: string
│
└── subscriptions/
    └── {userId}
        ├── id: string
        ├── userId: string
        ├── plan: 'free' | 'premium' | 'trial'
        ├── startDate: timestamp
        ├── endDate: timestamp
        ├── status: 'active' | 'expired' | 'cancelled'
        ├── price: number
        └── currency: string
```

---

## 🧪 Testing Your Firebase Integration

### 1. Test Registration
```bash
# Run your app
npm start

# Navigate to Register page
# Create an account with:
- Email: test@example.com
- Password: Test123!@#
- Parent name, child details
```

### 2. Check Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select "study-spark-b16c8"
3. Check **Authentication** → Users (should see your user)
4. Check **Firestore Database** → Data (should see users and children collections)

### 3. Test Login
- Try logging in with the account you created
- Try "Sign in with Google"
- Check that you redirect to Dashboard

### 4. Test Children Management
- Add another child
- View children in "My Children" page
- Check access codes are generated

---

## 🔧 Running the App

```bash
# Install dependencies (already done)
npm install

# Run in browser
npm run dev

# Run on Android
npm run build
npx cap sync android
npx cap open android

# Run on iOS
npm run build
npx cap sync ios
npx cap open ios
```

---

## 📱 Access Codes

Each child gets a unique 6-character access code (e.g., `A3K9F2`). Students can use this code to access their account via the "Student Access" page.

---

## 🎨 Next Steps

### Optional Enhancements:

1. **Add Profile Pictures**
   - Enable Firebase Storage
   - Upload user/child avatars

2. **Push Notifications**
   - Set up Firebase Cloud Messaging
   - Notify parents of student progress

3. **Analytics**
   - Firebase Analytics is already enabled
   - Track user engagement

4. **Email Verification**
   - Require email verification on signup
   - Add `sendEmailVerification()` function

5. **Social Logins**
   - Add Apple, Facebook, Microsoft sign-in
   - Already have Google set up

---

## ⚠️ Important Reminders

1. **API Keys**: Your Firebase config contains API keys. This is normal for web apps, but:
   - Apply security rules (done)
   - Don't commit sensitive data to public repos
   - Use environment variables in production

2. **Test Mode**: Remember to apply production security rules before March 24, 2026

3. **Backup**: Firebase automatically backs up data, but consider:
   - Exporting data periodically
   - Setting up Cloud Firestore backups

4. **Costs**: Current free tier limits:
   - 50K reads/day
   - 20K writes/day
   - 1GB storage
   - Monitor usage in Firebase Console

---

## 🆘 Troubleshooting

### "Permission denied" errors
- Check Firebase security rules
- Ensure user is authenticated
- Verify user has correct role

### "User not found" errors
- Ensure user document created during registration
- Check Firestore console for user data

### Google Sign-In not working
- Verify Google provider is enabled in Firebase Console
- Check OAuth consent screen configuration

### Build errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear Capacitor: `npx cap sync`

---

## 📚 Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Queries](https://firebase.google.com/docs/firestore/query-data/queries)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Ionic with Firebase](https://ionicframework.com/docs/native/firebase)

---

## ✅ Success Checklist

- [x] Firebase installed
- [x] Configuration file created
- [x] Authentication service set up
- [x] Firestore database service created
- [x] TypeScript types defined
- [x] Login/Register pages connected
- [x] Children management connected
- [x] Chat services implemented
- [x] Security rules provided
- [ ] Production rules applied (do this before launch!)

---

**Your app is now fully connected to Firebase! You're ready to start development.** 🎉

If you have any questions or need help, refer to the Firebase documentation or check the code examples in the services files.
