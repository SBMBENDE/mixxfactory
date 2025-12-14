# Email Service Configuration Guide

This guide shows how to set up email sending for password recovery and email verification.

## Quick Start (Choose One)

### Option 1: SendGrid (Recommended for Production)
**Best for:** Scale, reliability, advanced features
**Cost:** Free tier (100 emails/day), then paid

### Option 2: Resend (Modern, React-Friendly)
**Best for:** Easy setup, great docs, modern API
**Cost:** Free tier (100 emails/day), then paid

### Option 3: Gmail + Nodemailer (Free)
**Best for:** Small projects, testing
**Cost:** Free (requires App Password)

### Option 4: Mailtrap (Testing)
**Best for:** Development & testing only
**Cost:** Free tier

---

## 1️⃣ SendGrid Setup (Recommended)

### Step 1: Create SendGrid Account
1. Go to https://sendgrid.com
2. Sign up for free account
3. Verify your email

### Step 2: Create API Key
1. Go to **Settings** > **API Keys**
2. Click **Create API Key**
3. Name it: `MixxFactory`
4. Give it "Mail Send" access
5. Copy the API key (you won't see it again!)

### Step 3: Verify Sender Email
1. Go to **Settings** > **Sender Authentication** > **Single Sender Verification**
2. Click **Create New Sender**
3. Enter your email (e.g., `noreply@mixxfactory.com`)
4. Verify the confirmation email
5. Use this sender email in your code

### Step 4: Add to Environment Variables

**In `.env.local` (Development):**
```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@mixxfactory.com
SENDGRID_FROM_NAME=MixxFactory
```

**In Vercel (Production):**
1. Go to your Vercel project
2. Settings > Environment Variables
3. Add the 3 variables above
4. Environments: Production, Preview, Development

### Step 5: Create Email Utility

**Create `/lib/email/sendgrid.ts`:**
```typescript
import sgMail from '@sendgrid/mail';

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    const msg = {
      to: options.to,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@example.com',
      subject: options.subject,
      text: options.text || options.html,
      html: options.html,
      replyTo: 'support@mixxfactory.com',
    };

    console.log(`[Email] Sending to ${options.to}...`);
    await sgMail.send(msg);
    console.log(`[Email] Sent to ${options.to}`);
  } catch (error) {
    console.error('[Email Error]', error);
    throw new Error(`Failed to send email: ${error}`);
  }
}

// Verification Email Template
export function getVerificationEmailHTML(
  firstName: string,
  verificationUrl: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { color: #666; font-size: 12px; margin-top: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to MixxFactory! 🎉</h1>
          </div>
          <div class="content">
            <p>Hi ${firstName},</p>
            <p>Thank you for signing up! Please verify your email address to complete your registration.</p>
            <a href="${verificationUrl}" class="button">Verify Email</a>
            <p>Or copy this link:</p>
            <p style="word-break: break-all; background: white; padding: 10px; border-radius: 5px;">
              ${verificationUrl}
            </p>
            <p>This link expires in 24 hours.</p>
            <p>If you didn't create this account, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 MixxFactory. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Password Reset Email Template
export function getResetPasswordEmailHTML(
  firstName: string,
  resetUrl: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { color: #666; font-size: 12px; margin-top: 20px; text-align: center; }
          .warning { background: #fff3cd; padding: 10px; border-radius: 5px; color: #856404; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reset Your Password</h1>
          </div>
          <div class="content">
            <p>Hi ${firstName},</p>
            <p>We received a request to reset your password. Click the button below to create a new one.</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p>Or copy this link:</p>
            <p style="word-break: break-all; background: white; padding: 10px; border-radius: 5px;">
              ${resetUrl}
            </p>
            <div class="warning">
              <strong>⏱️ This link expires in 1 hour</strong>
            </div>
            <p>If you didn't request this, please ignore this email. Your password is still safe.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 MixxFactory. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
```

### Step 6: Install SendGrid Package
```bash
npm install @sendgrid/mail
```

### Step 7: Update Registration Endpoint

In `/app/api/auth/register/route.ts`, add the email sending:

```typescript
import { sendEmail, getVerificationEmailHTML } from '@/lib/email/sendgrid';

// ... inside the try block after creating user ...

// Send verification email (if email service is configured)
if (process.env.SENDGRID_API_KEY) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?email=${encodeURIComponent(email)}&token=${verificationToken}`;
  const emailHTML = getVerificationEmailHTML(email.split('@')[0], verificationUrl);
  
  try {
    await sendEmail({
      to: email,
      subject: 'Verify Your MixxFactory Email',
      html: emailHTML,
    });
  } catch (emailError) {
    console.warn('Email sending failed, but user created:', emailError);
    // Don't fail registration if email fails
  }
}
```

### Step 8: Update Resend Verification Endpoint

In `/app/api/auth/resend-verification/route.ts`, add:

```typescript
import { sendEmail, getVerificationEmailHTML } from '@/lib/email/sendgrid';

// ... inside the try block after updating token ...

// Send verification email
if (process.env.SENDGRID_API_KEY) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?email=${encodeURIComponent(email)}&token=${token}`;
  const emailHTML = getVerificationEmailHTML(user.firstName || email.split('@')[0], verificationUrl);
  
  try {
    await sendEmail({
      to: email,
      subject: 'Verify Your MixxFactory Email',
      html: emailHTML,
    });
  } catch (emailError) {
    console.warn('Email sending failed:', emailError);
  }
}
```

### Step 9: Update Password Reset Endpoint

In `/app/api/auth/forgot-password/route.ts`, add:

```typescript
import { sendEmail, getResetPasswordEmailHTML } from '@/lib/email/sendgrid';

// ... inside the try block after creating token ...

// Send password reset email
if (process.env.SENDGRID_API_KEY) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?email=${encodeURIComponent(email)}&token=${token}`;
  const emailHTML = getResetPasswordEmailHTML(user.firstName || email.split('@')[0], resetUrl);
  
  try {
    await sendEmail({
      to: email,
      subject: 'Reset Your MixxFactory Password',
      html: emailHTML,
    });
  } catch (emailError) {
    console.warn('Email sending failed:', emailError);
  }
}
```

### Step 10: Update .env.example

Add these to `.env.example`:
```env
# Email Service (SendGrid)
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@mixxfactory.com
SENDGRID_FROM_NAME=MixxFactory
```

---

## 2️⃣ Resend Setup (Alternative)

**Simpler alternative to SendGrid**

### Step 1: Create Resend Account
1. Go to https://resend.com
2. Sign up with your email
3. Verify email

### Step 2: Get API Key
1. Go to **Settings** > **API Keys**
2. Copy your API key

### Step 3: Verify Sender Domain (Optional)
1. Go to **Domains**
2. Add your domain (or use default)

### Step 4: Add to Environment

```env
EMAIL_SERVICE=resend
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@mixxfactory.com
```

### Step 5: Install Resend Package
```bash
npm install resend
```

### Step 6: Create Email Utility (`/lib/email/resend.ts`)

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@mixxfactory.com',
      to: options.to,
      subject: options.subject,
      html: options.html,
      replyTo: 'support@mixxfactory.com',
    });
    console.log(`[Email] Sent to ${options.to}`);
  } catch (error) {
    console.error('[Email Error]', error);
    throw new Error(`Failed to send email`);
  }
}
```

---

## 3️⃣ Gmail + Nodemailer (Free Option)

**Good for testing, limited to 500 emails/day**

### Step 1: Create Gmail App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer"
3. Google will generate a 16-character password
4. Copy it (no spaces)

### Step 2: Add to Environment

```env
EMAIL_SERVICE=gmail
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx
```

### Step 3: Install Nodemailer
```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

### Step 4: Create Email Utility (`/lib/email/nodemailer.ts`)

```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: options.to,
      subject: options.subject,
      html: options.html,
      replyTo: 'support@mixxfactory.com',
    });
    console.log(`[Email] Sent to ${options.to}`);
  } catch (error) {
    console.error('[Email Error]', error);
    throw new Error('Failed to send email');
  }
}
```

---

## 4️⃣ Mailtrap Setup (Testing Only)

**Free development email service**

### Step 1: Create Account
1. Go to https://mailtrap.io
2. Sign up for free
3. Create a new inbox

### Step 2: Get SMTP Credentials
1. Open your inbox
2. Click **Show Credentials**
3. Copy the SMTP settings

### Step 3: Add to Environment

```env
EMAIL_SERVICE=mailtrap
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_user_id
SMTP_PASSWORD=your_password
```

### Step 4: Create Utility (`/lib/email/mailtrap.ts`)

```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '2525'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    await transporter.sendMail({
      from: '"MixxFactory" <noreply@mailtrap.io>',
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  } catch (error) {
    console.error('[Email Error]', error);
    throw new Error('Failed to send email');
  }
}
```

---

## Testing Your Email Setup

### Test in Development

**1. Register a new account:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123"
  }'
```

**2. Check your inbox/Mailtrap:**
- Should see verification email
- Copy the verification link from email
- Click it or visit the URL

**3. Try password reset:**
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### Test in Production (Vercel)

1. Add environment variables to Vercel
2. Redeploy: `git push origin main`
3. Test at https://mixxfactory.vercel.app
4. Register with a real email
5. Check email inbox for verification link

---

## Common Issues

### "API Key is invalid"
- Check you copied the full key
- Verify no extra spaces
- In Vercel, ensure exact variable names match

### "Email not sending"
- Check NODE_ENV (some services don't send in dev)
- Verify sender email is whitelisted
- Check SendGrid/Resend dashboard for bounces

### "Emails going to spam"
- **SendGrid:** Verify domain with DKIM records
- **Resend:** Add DKIM/SPF records to domain
- **Gmail:** Sender email must be verified

### "504 timeout on registration"
- Email service is slow
- Wrap in try/catch (don't fail if email fails)
- Use background job queue (advanced)

---

## Production Checklist

- [ ] Choose email provider (SendGrid recommended)
- [ ] Create account and get API key
- [ ] Add environment variables to Vercel
- [ ] Update code with email sending (Options 1-4)
- [ ] Test registration with real email
- [ ] Test password reset flow
- [ ] Monitor email delivery in provider dashboard
- [ ] Set up email templates
- [ ] Configure domain authentication (optional but recommended)

---

## Next Steps

1. **Pick a provider** (SendGrid recommended)
2. **Create account** and get API key
3. **Install package:** `npm install @sendgrid/mail` (or resend, nodemailer)
4. **Create email utility** in `/lib/email/`
5. **Update endpoints** with email sending code
6. **Test locally** with dev email service
7. **Deploy to Vercel** with env vars
8. **Test in production**

---

**Questions?** Check the EMAIL_VERIFICATION_GUIDE.md for more details on the verification flow.
