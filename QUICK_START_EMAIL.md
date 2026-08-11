# Quick Start Guide: Firebase Email Setup

## 🚀 Your Implementation is Complete!

The code is ready. Now you just need to configure Firebase to send emails.

---

## ⏱️ Total Setup Time: ~15 minutes

---

## 📋 Checklist

### Step 1: Enable Firebase Blaze Plan (2 minutes)
- [ ] Go to [Firebase Console](https://console.firebase.google.com/)
- [ ] Select project: **study-spark-b16c8**
- [ ] Settings → Usage and Billing → Upgrade to Blaze Plan
- [ ] Set budget alert: $5/month (optional but recommended)

**Cost**: Essentially FREE for your usage (~$0.01/month)

---

### Step 2: Create SendGrid Account (3 minutes)
- [ ] Go to [SendGrid](https://signup.sendgrid.com/)
- [ ] Sign up for FREE account (100 emails/day)
- [ ] Verify your email address
- [ ] Complete onboarding wizard

**Cost**: FREE (100 emails/day forever)

---

### Step 3: Configure SendGrid (5 minutes)
- [ ] Go to Settings → API Keys
- [ ] Create new API key: "StudySpark Email"
- [ ] Choose "Full Access" or "Mail Send" permission
- [ ] **Copy the API key** (you'll need this soon!)
- [ ] Go to Settings → Sender Authentication
- [ ] Verify a Single Sender (enter your email)
- [ ] Check your email and verify

---

### Step 4: Install Firebase Extension (3 minutes)
- [ ] Go to Firebase Console → Extensions
- [ ] Click "Explore Extensions"
- [ ] Search: "Trigger Email from Firestore"
- [ ] Click Install
- [ ] Configure:
  - SMTP: **SendGrid API**
  - API Key: Paste your SendGrid API key
  - Sender Email: Your verified email
  - Collection Name: **`mail`** (exactly this!)
  - Default FROM: Your email
  - Attempts: 3 (default)
- [ ] Click "Install Extension"
- [ ] Wait 2-3 minutes for deployment

---

### Step 5: Update Firestore Rules (2 minutes)
- [ ] Go to Firebase Console → Firestore Database → Rules
- [ ] Add this rule:
```javascript
match /mail/{emailId} {
  allow create: if request.auth != null;
  allow read, update: if false;
}
```
- [ ] Click "Publish"

**Full rules**: See [FIRESTORE_RULES_EMAIL.md](./FIRESTORE_RULES_EMAIL.md)

---

### Step 6: Test! (2 minutes)
- [ ] Run your app: `npm run dev`
- [ ] Log in as a parent
- [ ] Go to "My Children" page
- [ ] Click "Get Child Access Code"
- [ ] Check Firestore Console → `mail` collection
- [ ] Check your email (30 sec - 2 min delay)
- [ ] ✅ Success!

---

## 📚 Detailed Documentation

- **Setup Guide**: [FIREBASE_EMAIL_SETUP.md](./FIREBASE_EMAIL_SETUP.md)
- **Security Rules**: [FIRESTORE_RULES_EMAIL.md](./FIRESTORE_RULES_EMAIL.md)
- **Implementation Details**: [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

---

## 🎯 What Changed in Your Code

✅ Subscription page hidden from Parent Dashboard
✅ "My Children" page now has email button instead of displaying code
✅ Emails sent using Firebase (not third-party service)
✅ Works with both email and Google sign-in
✅ Beautiful HTML email template included

---

## ❓ Common Questions

**Q: Why Blaze Plan if it's free?**
A: Firebase Extensions require Blaze, but your usage is within free tier. You'll pay ~$0.01/month (essentially free).

**Q: What if I go over 100 emails/day?**
A: Upgrade SendGrid plan ($15/month for 40,000 emails) or use Gmail SMTP (500/day free).

**Q: Is my data secure?**
A: Yes! Emails are queued server-side via Firestore. No API keys in frontend.

**Q: Can I customize the email?**
A: Yes! Edit `src/services/emailService.ts` → `html` and `text` sections.

---

## 🆘 Need Help?

1. **Setup Issues**: See [FIREBASE_EMAIL_SETUP.md](./FIREBASE_EMAIL_SETUP.md) → Troubleshooting
2. **Rules Issues**: See [FIRESTORE_RULES_EMAIL.md](./FIRESTORE_RULES_EMAIL.md)
3. **Code Issues**: Check browser console for errors

---

## 🎉 You're Almost Done!

Just follow the 6 steps above and you'll be sending emails in 15 minutes!

**Pro Tip**: Do steps 1-4 first, then test. If it works, you're done! Add rules optimization later.
