# Firestore Security Rules for Email Feature

## Add these rules to your Firestore Security Rules

To enable the email functionality, you need to update your Firestore Security Rules to allow authenticated users to write to the `mail` collection.

### How to Update Rules:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **study-spark-b16c8**
3. Go to **Firestore Database** → **Rules**
4. Add the `mail` collection rules below
5. Click **Publish**

### Rules to Add:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ===== EXISTING RULES (keep your current rules) =====
    // Your existing rules for users, children, messages, etc.
    
    // ===== NEW: EMAIL FUNCTIONALITY =====
    // Allow authenticated users to create email documents
    // The Firebase Extension will handle reading and updating
    match /mail/{emailId} {
      // Only authenticated users can create email documents
      allow create: if request.auth != null 
                    && request.resource.data.to is list
                    && request.resource.data.message is map
                    && request.resource.data.message.subject is string
                    && request.resource.data.message.html is string;
      
      // Only the Firebase Extension can read/update
      // (The extension runs with admin privileges)
      allow read, update, delete: if false;
    }
  }
}
```

### Complete Example (if starting fresh):

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
      allow read, write: if request.auth != null;
    }
    
    // Messages collection
    match /messages/{messageId} {
      allow read, write: if request.auth != null;
    }
    
    // Mail collection (for email functionality)
    match /mail/{emailId} {
      allow create: if request.auth != null 
                    && request.resource.data.to is list
                    && request.resource.data.message is map;
      allow read, update, delete: if false;
    }
  }
}
```

### Security Features:

✅ **Authentication Required**: Only logged-in users can queue emails
✅ **Data Validation**: Ensures proper email document structure
✅ **Restricted Access**: Users can only create, not read or modify emails
✅ **Extension Access**: Firebase Extension has admin access to process emails
✅ **No Direct Reads**: Prevents users from seeing queued emails

### Testing the Rules:

After publishing, test in the Firebase Console:

1. Go to **Firestore Database** → **Rules** → **Rules Playground**
2. Test these scenarios:
   - **Authenticated Create**: Should ALLOW
   - **Unauthenticated Create**: Should DENY
   - **Authenticated Read**: Should DENY
   - **Authenticated Update**: Should DENY

### What the Extension Does:

The Firebase Extension runs with **admin privileges**, so it can:
- Read documents from the `mail` collection
- Update document status (`pending` → `processing` → `success`)
- Add delivery information
- Delete old emails (if configured)

### Optional: Auto-Delete Old Emails

If you want to automatically delete sent emails after 7 days to save storage:

```javascript
match /mail/{emailId} {
  allow create: if request.auth != null 
                && request.resource.data.to is list
                && request.resource.data.message is map;
  
  // Allow deletion of emails older than 7 days
  allow delete: if request.auth != null 
                && request.time > resource.data.createdAt + duration.value(7, 'd');
  
  allow read, update: if false;
}
```

### Troubleshooting:

**Error: "Missing or insufficient permissions"**
- Make sure you published the rules
- Verify user is authenticated
- Check that document structure matches validation rules

**Emails not sending?**
- Rules are correct if documents appear in Firestore
- Check Firebase Extension configuration
- Review Extension logs for errors

### Next Steps:

1. ✅ Update Firestore Rules (add the `mail` collection rules)
2. ✅ Publish the rules
3. ✅ Test creating a document in the `mail` collection
4. ✅ Install Firebase Extension (see FIREBASE_EMAIL_SETUP.md)
5. ✅ Test the email functionality

---

**Security Note**: These rules are designed to be secure while allowing the email functionality to work properly. The Extension runs with admin privileges and can process the emails even though users can't read them.
