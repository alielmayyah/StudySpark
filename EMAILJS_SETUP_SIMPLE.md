# EmailJS Setup Guide (No Billing Required!)

## ✅ Why EmailJS?
- **100% FREE** - No credit card needed
- **100 emails/month** on free tier
- **5 minutes setup**
- **Works in browser** - No backend needed

---

## 🚀 Setup Steps (5 minutes)

### Step 1: Create EmailJS Account (1 minute)

1. Go to **[EmailJS.com](https://dashboard.emailjs.com/sign-up)**
2. Click **"Sign Up"**
3. Enter email and password (or sign up with Google)
4. **No credit card required!** ✅
5. Verify your email

---

### Step 2: Connect Your Email Service (2 minutes)

1. After logging in, click **"Email Services"** in the sidebar
2. Click **"Add New Service"**
3. Choose your email provider:
   - **Gmail** (recommended - easiest)
   - Outlook
   - Yahoo
   - Or any other provider

#### For Gmail (Recommended):
1. Click **"Gmail"**
2. Click **"Connect Account"**
3. Sign in with your Google account
4. Allow EmailJS permissions
5. **Done!** Your Service ID will appear (e.g., `service_abc123`)
6. **Copy this Service ID** - you'll need it in Step 4

---

### Step 3: Create Email Template (2 minutes)

1. Click **"Email Templates"** in the sidebar
2. Click **"Create New Template"**
3. **Template Settings**:
   - Template Name: `StudySpark Access Code`
4. **Edit the template content**:

**Subject:**
```
{{child_name}}'s Access Code for StudySpark
```

**Content (Body):**
```
Hello {{to_name}},

Here is the access code for your child {{child_name}}:

━━━━━━━━━━━━━━━━━━━━━━
ACCESS CODE: {{access_code}}
━━━━━━━━━━━━━━━━━━━━━━

Your child can use this code to access their StudySpark account.

Instructions:
1. Open StudySpark on your child's device
2. Select "Student Access"
3. Enter the access code above
4. Start learning!

If you have any questions, please contact us.

Best regards,
The StudySpark Team
```

5. Click **"Save"**
6. **Copy your Template ID** (e.g., `template_xyz789`)

---

### Step 4: Get Your Public Key

1. Click on your **username** (top right)
2. Click **"Account"**
3. Scroll down to **"API Keys"** section
4. You'll see your **Public Key** (e.g., `aBcDeFgHiJkLmNo`)
5. **Copy this Public Key**

---

### Step 5: Update Your Code

1. Open: `src/services/emailService.ts`
2. Replace these three values:

```typescript
const EMAILJS_SERVICE_ID = 'service_abc123';      // From Step 2
const EMAILJS_TEMPLATE_ID = 'template_xyz789';    // From Step 3
const EMAILJS_PUBLIC_KEY = 'aBcDeFgHiJkLmNo';     // From Step 4
```

**Example:**
```typescript
const EMAILJS_SERVICE_ID = 'service_x7j9k2p';
const EMAILJS_TEMPLATE_ID = 'template_4m8n1q5';
const EMAILJS_PUBLIC_KEY = 'uR3Kp9FmXyZ5nQw';
```

3. **Save the file**

---

## ✅ Test It!

1. Run your app:
   ```bash
   npm run dev
   ```

2. Log in as a parent
3. Go to **"My Children"** page
4. Click **"Get Child Access Code"** button
5. Check your email inbox (should arrive in 10-30 seconds)

**Success!** 🎉

---

## 🔧 Troubleshooting

### Email not received?

1. **Check spam/junk folder**
2. **Check EmailJS Dashboard:**
   - Go to [EmailJS Dashboard](https://dashboard.emailjs.com/)
   - Click "Email History" to see if email was sent
3. **Verify credentials:**
   - Make sure Service ID, Template ID, and Public Key are correct
   - No spaces or extra characters
4. **Check browser console:**
   - Press F12 in browser
   - Look for error messages

### "EmailJS is not configured" error?

- Make sure you replaced `YOUR_SERVICE_ID`, `YOUR_TEMPLATE_ID`, and `YOUR_PUBLIC_KEY` in the code
- Save the file and refresh the browser

### Rate Limit (100 emails/month)?

- Free tier: 100 emails/month
- For more emails: Upgrade to paid plan ($10/month for 1,000 emails)
- Or use multiple EmailJS accounts with different email services

---

## 💡 Tips

✅ **Use Gmail** - Easiest setup
✅ **Whitelist StudySpark** - Add to contacts to avoid spam
✅ **Test immediately** - Verify it works before production
✅ **Monitor usage** - Check EmailJS dashboard for usage stats

---

## 🆘 Still Having Issues?

1. **EmailJS Documentation**: [docs.emailjs.com](https://www.emailjs.com/docs/)
2. **EmailJS Support**: [Contact Support](https://www.emailjs.com/support/)
3. **Video Tutorial**: Search YouTube for "EmailJS setup tutorial"

---

## 🎉 That's It!

No billing info needed, no credit card, completely free for your needs!

**Total Setup Time**: ~5 minutes
**Cost**: $0 (FREE forever for 100 emails/month)
