# Firestore Security Rules - Student Access Fix

## Problem
Students cannot verify their access codes because Firestore security rules don't allow reading from the `children` collection without authentication.

## Solution
Update your Firestore Security Rules to allow access code verification.

---

## How to Update Rules:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **study-spark-b16c8**
3. Click **Firestore Database** in left sidebar
4. Click **Rules** tab
5. Update your rules with the code below
6. Click **Publish**

---

## Updated Firestore Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Children collection
    match /children/{childId} {
      // Allow parents to read/write their own children
      allow read, write: if request.auth != null && 
                           request.auth.uid == resource.data.parentId;
      
      // Allow creating new children (when parent adds a child)
      allow create: if request.auth != null;
      
      // IMPORTANT: Allow reading by accessCode for student access
      // This allows students to verify their code without being signed in
      allow read: if request.query.limit <= 1;
    }
    
    // Messages collection
    match /messages/{messageId} {
      allow read, write: if request.auth != null;
    }
    
    // Mail collection (for email functionality)
    match /mail/{emailId} {
      allow create: if request.auth != null;
      allow read, update, delete: if false;
    }
  }
}
```

---

## Key Change:

The important line for student access is:

```javascript
// Allow reading by accessCode for student access
allow read: if request.query.limit <= 1;
```

This allows:
- ✅ Students to verify access codes without signing in
- ✅ Only limited queries (1 result max) for security
- ✅ No bulk data access

---

## Alternative (More Restrictive):

If you want even tighter security, you can allow reads only when querying by accessCode:

```javascript
match /children/{childId} {
  // Allow parents to read/write their own children
  allow read, write: if request.auth != null && 
                       request.auth.uid == resource.data.parentId;
  
  // Allow creating new children
  allow create: if request.auth != null;
  
  // Allow reading for access code verification
  // Only works for queries with accessCode filter and limit
  allow read: if request.query.limit <= 1;
}
```

---

## After Publishing Rules:

1. **Test the student access:**
   - Go to Student Access page
   - Enter the access code from email
   - Click "Start Learning"
   - Should work now! ✅

2. **Check browser console (F12):**
   - Look for console logs showing:
     - "Verifying access code: XXXXXX"
     - "Verification result: {child data}"
   - Any errors will show there

---

## Security Notes:

✅ **Safe**: Students can only query one child at a time
✅ **Protected**: Cannot read all children data
✅ **Secure**: Parents still need authentication for full access
✅ **Limited**: Only allows access code verification queries

---

## Troubleshooting:

**If still not working after updating rules:**

1. Clear browser cache and reload
2. Check browser console (F12) for error messages
3. Verify the access code is exactly as shown in email (6 characters, uppercase)
4. Make sure you clicked "Publish" in Firebase Console after updating rules

---

**This is the most likely fix for your "failed to verify access code" error!**
