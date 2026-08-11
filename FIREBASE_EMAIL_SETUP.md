# Firebase Email Setup Guide for StudySpark

This guide will help you set up Firebase Extensions to send access codes to parent emails automatically.

## Overview

We're using the **"Trigger Email from Firestore"** Firebase Extension, which automatically sends emails when documents are added to a Firestore collection. This integrates perfectly with your existing Firebase setup.

## Prerequisites

- ✅ Firebase project already set up (you have this!)
- ✅ Firestore already configured (you have this!)
- ✅ Billing enabled on Firebase (required for extensions)

## Step 1: Enable Billing (Required for Extensions)

Firebase Extensions require the **Blaze (pay-as-you-go) plan**, but it's essentially free for your use case:

1. Go to your [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **study-spark-b16c8**
3. Click on the **gear icon** (Settings) → **Usage and Billing**
4. Click **Modify Plan** → Choose **Blaze Plan**
5. Set a **budget alert** (e.g., $5/month) to stay safe

**Don't worry about costs:**
- First 100 emails/day are FREE with SendGrid
- Your usage will likely be well within free tier
- You can set spending limits

## Step 2: Install the Email Extension

### Option A: Via Firebase Console (Easiest)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **study-spark-b16c8**
3. Click **Extensions** in the left sidebar
4. Click **Explore Extensions**
5. Search for **"Trigger Email from Firestore"**
6. Click **Install**

### Option B: Via Firebase CLI

```bash
firebase ext:install firestore-send-email --project=study-spark-b16c8
```

## Step 3: Configure the Extension

During installation, you'll be asked several questions:

### Configuration Settings:

1. **Which SMTP connection do you want to use?**
   - Choose: **SendGrid API** (recommended, has free tier)
   - Alternative: **Gmail SMTP** (if you prefer)

2. **What is your SendGrid API key?**
   - Go to [SendGrid](https://signup.sendgrid.com/) and create a free account
   - Navigate to **Settings** → **API Keys**
   - Create a new API key with **Mail Send** permission
   - Copy and paste the API key

3. **What email address do you want to use as the sender?**
   - Enter: Your email (e.g., `noreply@studyspark.com` or your Gmail)
   - Must be verified in SendGrid

4. **What is the name of the Firestore collection where you'll queue emails?**
   - Enter: **`mail`** (this is what our code uses)

5. **Should the extension use a default FROM address?**
   - Enter your email again (e.g., `StudySpark <noreply@studyspark.com>`)

6. **Should the extension use a default REPLY-TO address?**
   - Enter your support email or leave blank

7. **How many attempts should be made to deliver emails?**
   - Leave default: **3**

## Step 4: Set Up SendGrid (Free Tier)

### Create SendGrid Account:

1. Go to [SendGrid](https://signup.sendgrid.com/)
2. Sign up for a **FREE account** (100 emails/day forever)
3. Verify your email address
4. Complete the onboarding wizard

### Create API Key:

1. Go to **Settings** → **API Keys**
2. Click **Create API Key**
3. Name it: "StudySpark Email"
4. Choose: **Full Access** or **Restricted Access** (select Mail Send permission)
5. Copy the API key (you'll need this for the extension)

### Verify Sender Email:

1. Go to **Settings** → **Sender Authentication**
2. Click **Verify a Single Sender**
3. Fill in your email details
4. Check your email and verify

**Note:** With the free tier, you must use a verified sender email.

## Step 5: Test the Setup

Once the extension is installed:

1. Start your app: `npm run dev`
2. Log in as a parent
3. Go to "My Children" page
4. Click "Get Child Access Code"
5. Check the Firestore console:
   - Go to **Firestore Database**
   - Look for the **mail** collection
   - You should see a new document with `status: 'success'` or `status: 'processing'`
6. Check your email inbox (may take 30 seconds - 2 minutes)

## How It Works

```
User clicks "Get Child Access Code"
         ↓
App writes to Firestore 'mail' collection
         ↓
Firebase Extension detects new document
         ↓
Extension sends email via SendGrid
         ↓
Extension updates document status to 'success'
         ↓
Parent receives email with access code
```

## Firestore Collection Structure

When you send an email, this document is created in the `mail` collection:

```javascript
{
  to: ['parent@email.com'],
  message: {
    subject: "Child's Access Code for StudySpark",
    html: '<html email content>',
    text: 'plain text version'
  },
  createdAt: Timestamp,
  status: 'pending' // Changes to 'processing' then 'success' or 'error'
}
```

## Troubleshooting

### Emails Not Sending?

1. **Check Firestore Console:**
   - Go to your `mail` collection
   - Look at the document status
   - If `status: 'error'`, check the `delivery.error` field

2. **Check Extension Logs:**
   - Go to **Extensions** in Firebase Console
   - Click on "Trigger Email from Firestore"
   - View **Function Logs**

3. **Common Issues:**
   - ❌ **API Key Invalid:** Regenerate SendGrid API key
   - ❌ **Sender Not Verified:** Verify your sender email in SendGrid
   - ❌ **Billing Not Enabled:** Enable Blaze plan
   - ❌ **Collection Name Wrong:** Must be exactly `mail`

### Rate Limits

- **SendGrid Free Tier:** 100 emails/day
- **Firebase Extensions:** No additional limits
- **Firestore:** Plenty of free quota for your use case

### Email Goes to Spam?

- Verify your domain in SendGrid (for production)
- Use SPF and DKIM records
- Ask users to whitelist your sender email

## Alternative: Use Gmail SMTP

If you prefer using Gmail instead of SendGrid:

1. Enable **2-Step Verification** on your Google account
2. Generate an **App Password**:
   - Go to Google Account → Security → App Passwords
   - Create password for "Mail"
3. During extension setup, choose **Gmail SMTP**
4. Enter your Gmail and app password

**Note:** Gmail has stricter limits (500 emails/day).

## Costs (Don't Worry!)

- **Firebase Blaze Plan:** Free for your usage
- **SendGrid Free Tier:** 100 emails/day forever
- **Firebase Extension:** Free (just Firestore reads/writes)
- **Estimated Monthly Cost:** $0 - $0.50 (mostly free!)

## Security Notes

✅ No API keys in frontend code
✅ All email logic server-side (via extension)
✅ Secure Firebase security rules apply
✅ Parent emails are already in your system

## Next Steps

After setup:
1. Test thoroughly with different email providers
2. Monitor the `mail` collection for any errors
3. Set up Firebase budget alerts
4. Consider customizing email templates
5. Add error logging/monitoring

## Support

- [Firebase Extensions Documentation](https://firebase.google.com/docs/extensions)
- [Trigger Email Extension Docs](https://extensions.dev/extensions/firebase/firestore-send-email)
- [SendGrid Documentation](https://docs.sendgrid.com/)

## Cleanup Old Extension Data (Optional)

To avoid clutter, you can set up a Cloud Function to delete old `mail` documents after 7 days. This is optional and can be done later.
