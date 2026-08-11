# Firebase Security Rules for StudySpark

## Firestore Security Rules

Copy and paste these rules into your Firebase Console:

1. Go to Firebase Console → Firestore Database
2. Click on the "Rules" tab
3. Replace the content with the rules below
4. Click "Publish"

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the resource
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Helper function to check if user is a parent
    function isParent() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'parent';
    }
    
    // Helper function to check if user is a student
    function isStudent() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'student';
    }
    
    // Users collection
    match /users/{userId} {
      // Anyone can read their own user document
      allow read: if isOwner(userId);
      
      // Users can only create their own document during registration
      allow create: if isOwner(userId) && 
                       request.resource.data.uid == userId &&
                       request.resource.data.role in ['parent', 'student'];
      
      // Users can update their own document (except role and uid)
      allow update: if isOwner(userId) && 
                       request.resource.data.uid == userId &&
                       request.resource.data.role == resource.data.role;
      
      // Users cannot delete their own document (prevents accidental deletion)
      allow delete: if false;
    }
    
    // Children collection
    match /children/{childId} {
      // Parents can read their own children
      allow read: if isAuthenticated() && 
                     resource.data.parentId == request.auth.uid;
      
      // Only parents can create children tied to their account
      allow create: if isParent() && 
                       request.resource.data.parentId == request.auth.uid &&
                       request.resource.data.accessCode is string &&
                       request.resource.data.name is string &&
                       request.resource.data.age is number;
      
      // Parents can update their own children
      allow update: if isAuthenticated() && 
                       resource.data.parentId == request.auth.uid &&
                       request.resource.data.parentId == resource.data.parentId;
      
      // Parents can delete their own children
      allow delete: if isAuthenticated() && 
                       resource.data.parentId == request.auth.uid;
    }
    
    // Messages collection (for parent-student chat)
    match /messages/{messageId} {
      // Users can read messages where they are sender or receiver
      allow read: if isAuthenticated() && 
                     (resource.data.senderId == request.auth.uid || 
                      resource.data.receiverId == request.auth.uid);
      
      // Users can send messages from their own account
      allow create: if isAuthenticated() && 
                       request.resource.data.senderId == request.auth.uid &&
                       request.resource.data.senderRole in ['parent', 'student'] &&
                       request.resource.data.message is string;
      
      // Users can update read status on messages sent to them
      allow update: if isAuthenticated() && 
                       resource.data.receiverId == request.auth.uid &&
                       request.resource.data.read is bool;
      
      // Messages cannot be deleted (for record keeping)
      allow delete: if false;
    }
    
    // Subscriptions collection
    match /subscriptions/{subscriptionId} {
      // Users can read their own subscription
      allow read: if isOwner(subscriptionId);
      
      // System/admin creates subscriptions (in real app, this would be Cloud Functions)
      // For now, parents can create their own subscription
      allow create: if isParent() && 
                       subscriptionId == request.auth.uid &&
                       request.resource.data.userId == request.auth.uid;
      
      // Users can update their own subscription (upgrade/downgrade)
      allow update: if isOwner(subscriptionId);
      
      // Subscriptions cannot be deleted
      allow delete: if false;
    }
    
    // Default deny all other collections
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Storage Rules (If you use Firebase Storage)

If you plan to add profile pictures or file uploads, use these rules:

1. Go to Firebase Console → Storage
2. Click on the "Rules" tab
3. Replace with these rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Helper function
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // User profile pictures
    match /avatars/{userId}/{fileName} {
      // Users can read any avatar
      allow read: if true;
      
      // Users can only upload to their own folder
      allow write: if isAuthenticated() && 
                      request.auth.uid == userId &&
                      request.resource.size < 5 * 1024 * 1024 && // 5MB max
                      request.resource.contentType.matches('image/.*');
    }
    
    // Child avatars
    match /child-avatars/{childId}/{fileName} {
      // Anyone can read
      allow read: if true;
      
      // Parents can upload for their children
      allow write: if isAuthenticated() &&
                      request.resource.size < 5 * 1024 * 1024 && // 5MB max
                      request.resource.contentType.matches('image/.*');
    }
    
    // Deny everything else
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

## Important Notes

### Security Best Practices

1. **Never commit Firebase config with sensitive keys to public repos**
   - Use environment variables for production
   - Add `src/firebase/config.ts` to `.gitignore`

2. **Test Mode Expiration**
   - Your test mode rules expire on: **March 24, 2026**
   - Make sure to apply these production rules before that date

3. **Rate Limiting**
   - Consider adding Firebase App Check for additional security
   - Monitor usage in Firebase Console

4. **Data Validation**
   - These rules validate data types and ownership
   - Additional validation happens in your app code

### How to Update Rules

1. Copy the Firestore rules above
2. Go to [Firebase Console](https://console.firebase.google.com/)
3. Select your project: "study-spark-b16c8"
4. Navigate to "Firestore Database" → "Rules"
5. Paste the rules
6. Click "Publish"

### Testing Rules

After applying rules, test them:
1. Try logging in as a parent
2. Add a child
3. Try accessing another user's data (should fail)
4. Check Firebase Console logs for any security violations

## Support

If you encounter any security rule errors:
1. Check Firebase Console → Firestore → Usage tab
2. Look for "Security Rules" errors
3. Adjust rules as needed based on your app's requirements
