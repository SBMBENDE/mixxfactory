# OAuth Social Login Setup Guide

Complete guide for implementing Google and Facebook authentication on Afrobizz.

---

## 🎯 Overview

Social login allows users to authenticate using their existing Google or Facebook accounts, providing a faster and more convenient registration/login experience.

**Benefits:**
- ✅ Faster user onboarding
- ✅ Pre-verified email addresses
- ✅ Reduced password fatigue
- ✅ Higher conversion rates
- ✅ Trusted authentication providers

---

## 📋 Prerequisites

- Active Afrobizz account with admin access
- Google Cloud Console account
- Facebook Developer account
- Domain configured: https://afrobizz.com

---

## 🔧 Part 1: Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Enter project name: `Afrobizz`
4. Click **"Create"**

### Step 2: Enable Google+ API

1. In your project, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"**
3. Click **"Enable"**

### Step 3: Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Select **"External"** user type
3. Click **"Create"**
4. Fill in required fields:
   - **App name:** Afrobizz
   - **User support email:** Your email
   - **App logo:** Upload Afrobizz logo (optional)
   - **Authorized domains:** `afrobizz.com`
   - **Developer contact email:** Your email
5. Click **"Save and Continue"**
6. **Scopes:** Add these scopes:
   - `userinfo.email`
   - `userinfo.profile`
7. Click **"Save and Continue"**
8. **Test users:** Add your email for testing
9. Click **"Save and Continue"**

### Step 4: Create OAuth Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. Select **"Web application"**
4. Fill in:
   - **Name:** Afrobizz Web Client
   - **Authorized JavaScript origins:**
     ```
     https://afrobizz.com
     http://localhost:3000
     ```
   - **Authorized redirect URIs:**
     ```
     https://afrobizz.com/api/auth/callback/google
     http://localhost:3000/api/auth/callback/google
     ```
5. Click **"Create"**
6. **Copy and save:**
   - Client ID (e.g., `123456789-abcdef.apps.googleusercontent.com`)
   - Client Secret (e.g., `GOCSPX-abc123...`)

### Step 5: Add to Environment Variables

Add to `.env.local`:

```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

Add to Vercel:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add both variables for **Production**, **Preview**, and **Development**

---

## 🔷 Part 2: Facebook OAuth Setup

### Step 1: Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **"My Apps"** → **"Create App"**
3. Select **"Consumer"** app type
4. Fill in:
   - **App Display Name:** Afrobizz
   - **App Contact Email:** Your email
5. Click **"Create App"**

### Step 2: Add Facebook Login Product

1. In your app dashboard, find **"Facebook Login"**
2. Click **"Set Up"**
3. Select **"Web"** platform
4. Enter Site URL: `https://afrobizz.com`
5. Click **"Save"** and **"Continue"**

### Step 3: Configure Facebook Login Settings

1. Go to **Products** → **Facebook Login** → **Settings**
2. Add **Valid OAuth Redirect URIs:**
   ```
   https://afrobizz.com/api/auth/callback/facebook
   http://localhost:3000/api/auth/callback/facebook
   ```
3. Enable **"Login with the JavaScript SDK"**
4. Enable **"Web OAuth Login"**
5. Click **"Save Changes"**

### Step 4: Configure App Settings

1. Go to **Settings** → **Basic**
2. Fill in:
   - **App Domains:** `afrobizz.com`
   - **Privacy Policy URL:** `https://afrobizz.com/privacy`
   - **Terms of Service URL:** `https://afrobizz.com/terms`
   - **App Icon:** Upload Afrobizz logo (1024x1024px)
3. Scroll down to find:
   - **App ID** (e.g., `1234567890123456`)
   - **App Secret** (click **"Show"** to reveal)
4. **Copy and save both values**

### Step 5: Switch to Live Mode

1. In app dashboard, toggle **"App Mode"** from **Development** to **Live**
2. Confirm the switch
3. Your app is now ready for production use

### Step 6: Add to Environment Variables

Add to `.env.local`:

```env
FACEBOOK_CLIENT_ID=your_facebook_app_id_here
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret_here
```

Add to Vercel:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add both variables for **Production**, **Preview**, and **Development**

---

## 🔐 Part 3: NextAuth Configuration

Your `.env.local` should now have:

```env
# MongoDB
MONGODB_URI=mongodb+srv://...

# JWT & NextAuth
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
NEXTAUTH_URL=https://afrobizz.com
NEXTAUTH_SECRET=your_super_secret_jwt_key_here_min_32_chars

# Google OAuth
GOOGLE_CLIENT_ID=123456789-abcdef.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123...

# Facebook OAuth
FACEBOOK_CLIENT_ID=1234567890123456
FACEBOOK_CLIENT_SECRET=abc123def456...

# App
NEXT_PUBLIC_APP_URL=https://afrobizz.com
```

**Important Notes:**
- `NEXTAUTH_SECRET` can be the same as `JWT_SECRET`
- For local development, use `http://localhost:3000` for URLs
- Never commit `.env.local` to version control

---

## 🧪 Part 4: Testing

### Test Locally

1. Start dev server:
   ```bash
   npm run dev
   ```

2. Visit http://localhost:3000/auth/login

3. Click **"Sign in with Google"** or **"Sign in with Facebook"**

4. Verify:
   - OAuth popup appears
   - User can select account
   - User is redirected to `/professional` dashboard
   - User record is created in MongoDB

### Test Production

1. Deploy to Vercel (automatic from git push)

2. Visit https://afrobizz.com/auth/login

3. Test both Google and Facebook login

4. Verify:
   - SSL certificate is valid
   - OAuth redirects work correctly
   - User session persists
   - Email is marked as verified

---

## 🔍 Troubleshooting

### Google Issues

**Error: "redirect_uri_mismatch"**
- Check authorized redirect URIs in Google Console
- Ensure exact match with callback URL
- Wait 5 minutes after updating settings

**Error: "access_denied"**
- User declined permissions
- App may be in testing mode (add test users)

### Facebook Issues

**Error: "Can't Load URL"**
- Check Valid OAuth Redirect URIs in Facebook settings
- Ensure app is in "Live" mode for production
- Verify domain ownership

**Error: "App Not Setup"**
- Facebook Login product not added
- Check OAuth redirect URIs are saved

### General Issues

**Session not persisting:**
- Check `NEXTAUTH_SECRET` is set
- Verify cookies are enabled
- Check domain matches in production

**User not created in database:**
- Check MongoDB connection string
- Verify User model has `authProvider` field
- Check server logs for errors

---

## 📊 Database Schema

OAuth users are stored with these additional fields:

```typescript
{
  email: "user@gmail.com",
  name: "John Doe",
  emailVerified: true, // Auto-verified for OAuth
  accountType: "professional",
  authProvider: "google", // or "facebook"
  authProviderId: "123456789", // Provider's user ID
  profilePicture: "https://...", // From OAuth profile
  createdAt: "2026-01-13T..."
}
```

---

## 🚀 Production Checklist

- [ ] Google OAuth credentials configured
- [ ] Facebook OAuth credentials configured
- [ ] Environment variables added to Vercel
- [ ] Callback URLs include production domain
- [ ] Google app verified (if needed for large scale)
- [ ] Facebook app in "Live" mode
- [ ] Privacy policy and terms of service published
- [ ] Social login buttons appear on login/register pages
- [ ] Test accounts created successfully
- [ ] Email verification bypassed for OAuth users
- [ ] User roles assigned correctly
- [ ] Analytics tracking OAuth signups

---

## 📱 User Experience

### First-Time OAuth User

1. User clicks "Sign in with Google"
2. Google popup opens for account selection
3. User grants email/profile permissions
4. User is redirected to Afrobizz dashboard
5. Account created with verified email
6. User can immediately register as professional

### Existing Email/Password User

If a user previously registered with email/password using `john@gmail.com`, then tries to sign in with Google using the same email:

- The accounts are **automatically linked**
- OAuth provider added to existing account
- User can use either method to login
- Email is marked as verified

---

## 🔒 Security Best Practices

1. **Never expose secrets:**
   - Keep Client Secrets in `.env.local`
   - Don't commit to git
   - Use Vercel environment variables

2. **Validate redirect URIs:**
   - Only whitelist your domains
   - Don't use wildcards

3. **Verify email domain:**
   - OAuth providers verify email ownership
   - Trust OAuth emails as verified

4. **Session management:**
   - Use NextAuth's built-in JWT
   - Set appropriate expiration (30 days)
   - Implement logout functionality

5. **Monitor usage:**
   - Track OAuth signup rates
   - Watch for suspicious activity
   - Check provider dashboards for issues

---

## 📚 Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth Guide](https://developers.google.com/identity/protocols/oauth2)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login)
- [MongoDB User Model](../lib/db/models.ts)

---

**Last Updated:** January 13, 2026  
**Status:** Production Ready 🚀
