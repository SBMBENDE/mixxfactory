# SendGrid Setup Walkthrough

## Current Step: Domain Setup

You're at the "Set Up Sending" step. Here are your options:

### Option 1: Skip Domain Setup (Easiest - Recommended for Now)

If you don't have a custom domain yet, you can:
1. Click **"No"** on "Would you like to brand the link for this domain?"
2. Click **"Skip for Now"** (or similar button)
3. Use SendGrid's default sender authentication
4. You'll proceed to create an API Key

**Why:** Easier to start, you can add domain later. Emails will still deliver fine.

### Option 2: Use Your Domain (Better for Production)

If you have a domain (like `mixxfactory.com`):

**Step 1: Enter Your Domain**
1. In the domain field, enter: `mixxfactory.com` (or your actual domain)
2. Click "Next"

**Step 2: Add DNS Records**
SendGrid will give you CNAME records to add. You'll see something like:
```
Name: em1234.mixxfactory.com
Value: sendgrid.net
```

**Step 3: Add to Your Domain Provider**
1. Go to your domain registrar (GoDaddy, Namecheap, etc.)
2. Go to DNS settings
3. Add the CNAME record SendGrid provided
4. Wait 24-48 hours for DNS to propagate

**Step 4: Return to SendGrid**
1. Click "Verify" in SendGrid
2. It will check if DNS records are added correctly
3. Once verified, you can send from your domain

---

## Quick Recommendation for You

Since you're just starting:

1. **Click "No"** on the domain branding question
2. **Click "Skip for Now"** or "Continue"
3. **Proceed to create an API Key**
4. **Skip domain setup** (can do this later)

This gets you sending emails quickly. Once you have a real domain, you can come back and add it.

---

## Next Steps After Domain Setup

### 1. Create an API Key

After domain setup, you should see a page asking you to:
- **Click "Create API Key"**
- Name it: `MixxFactory` or `Development`
- Select "Full Access" or "Mail Send" only
- Copy the key (you won't see it again!)

### 2. Get Your Sender Email

You also need a verified sender email:
1. Go to **Settings** → **Sender Authentication**
2. Click **Create New Sender** or **Verify Sender**
3. Enter sender email: `noreply@mixxfactory.com`
4. Or use: `admin@mixxfactory.com`
5. Verify the confirmation email

### 3. Copy Your Credentials

Save these somewhere safe (or in .env.local):
```
SENDGRID_API_KEY = SG.xxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL = noreply@mixxfactory.com
SENDGRID_FROM_NAME = MixxFactory
```

### 4. Install SendGrid in Your Project

```bash
npm install @sendgrid/mail
```

### 5. Create the Email Utility

Copy the code from EMAIL_SERVICE_SETUP.md into `/lib/email/sendgrid.ts`

### 6. Update Your Endpoints

Add email sending to:
- `/app/api/auth/register/route.ts` (verification emails)
- `/app/api/auth/resend-verification/route.ts` (resend verification)
- `/app/api/auth/forgot-password/route.ts` (password reset)

---

## What to Do Right Now

1. **At the domain question: Click "No"** (skip for now)
2. **Continue/Skip** to get past this screen
3. **Look for "Create API Key"** button
4. **Name it:** `MixxFactory`
5. **Copy the API key** (save it!)
6. **Come back and let me know** when you have the API key

---

## Example: After You Click "No"

You'll likely see this screen:
```
✓ Domain Setup Complete

API Key Created: [Show/Hide]
SG.xxxxxxxxxxxxxxxxxxxx

From Email: [Add Sender]

Next Steps:
1. Create API Key ← [Do this]
2. Add Sender Identity ← [Do this]
3. Send Test Email ← [Do this]
```

**Just click "Create API Key"** and follow the prompts.

---

## When You Have the API Key

Once you have it, tell me and I'll:
1. Create the `/lib/email/sendgrid.ts` file
2. Update all your endpoints to send emails
3. Add it to `.env.local`
4. Test that emails work

---

## Questions?

- **"Do I need a domain to send emails?"** No, skip it for now
- **"Where is the API Key button?"** Usually in Settings > API Keys
- **"Can I change the sender email later?"** Yes, anytime
- **"What if I want to add domain later?"** Easy - go back to SendGrid settings

---

## Checklist

- [ ] Clicked "No" on domain branding (or added domain)
- [ ] Skipped or completed domain setup
- [ ] Found the "Create API Key" section
- [ ] Created API Key named "MixxFactory"
- [ ] Copied API Key to safe location
- [ ] Added/verified sender email
- [ ] Ready to implement in code

**Next: Tell me when you have the API key!**
