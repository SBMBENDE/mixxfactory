/**
 * Email Verification System Documentation
 */

# Email Verification System - Complete Guide

## ✅ What's Now Available

The email verification system is **fully implemented and ready to use**. It includes:

- ✅ Email verification token generation (24-hour expiry)
- ✅ Token validation endpoint
- ✅ Email verification page with link handler
- ✅ Resend verification email page
- ✅ Automatic token generation on registration
- ✅ Development mode with token display for testing

---

## Flow Diagram

```
1. User Registration
   ↓
2. System generates verification token (24-hour expiry)
   ↓
3. User receives verification email with link*
   ↓
4. User clicks link → /auth/verify-email?email=...&token=...
   ↓
5. Page validates token
   ↓
6. Email marked as verified ✓
   ↓
7. Redirects to login
```

*Email sending requires email service configuration (step below)

---

## API Endpoints

### 1. Email Verification
**POST** `/api/auth/verify-email`

**Request:**
```json
{
  "email": "user@example.com",
  "token": "64_char_hex_string"
}
```

**Response (Success - 200):**
```json
{
  "message": "Email verified successfully! You can now login.",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "emailVerified": true
  }
}
```

**Response (Error - 400):**
```json
{
  "error": "Invalid verification token"
}
```

**Error Cases:**
- `"User not found"` - Email doesn't exist (404)
- `"Email is already verified"` - Already verified (200)
- `"Verification token has expired"` - Token older than 24 hours (400)
- `"Invalid verification token"` - Token doesn't match (400)

---

### 2. Resend Verification Email
**POST** `/api/auth/resend-verification`

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "If an account exists with this email, a verification link has been sent.",
  // In development only:
  "verificationLink": "http://localhost:3000/auth/verify-email?email=...",
  "token": "64_char_hex_string",
  "expiresAt": "2024-01-01T12:00:00Z"
}
```

**Note:** Doesn't reveal if email exists (security best practice)

---

## Pages

### 1. Verify Email Page
**Path:** `/auth/verify-email`

**URL Parameters:**
- `email` - User's email address
- `token` - Verification token from email

**Example:**
```
/auth/verify-email?email=user@example.com&token=abc123...
```

**Behavior:**
- Automatically validates token on page load
- Shows loading indicator while validating
- Displays success message and redirects to login after 3 seconds
- Shows error with next steps if token is invalid/expired
- Allows manual retry or register again

### 2. Resend Verification Page
**Path:** `/auth/resend-verification`

**Behavior:**
- User enters email
- System generates new token
- Displays success message (doesn't reveal if email exists)
- In development: shows verification link for testing
- User can request multiple new tokens

---

## Registration Flow

When user registers:

1. ✅ User submits: `POST /api/auth/register`
2. ✅ System creates user with verification token
3. ✅ Returns verification link (in development only)
4. ✅ User auto-logged in (can use app while verifying)
5. ⏳ **TODO:** Email service sends verification email
6. ✅ User clicks email link
7. ✅ Token validated and email marked verified

**Response includes (development mode):**
```json
{
  "success": true,
  "data": {
    "userId": "...",
    "email": "user@example.com",
    "emailVerified": false
  },
  "message": "Registration successful! Please verify your email.",
  "verificationLink": "http://localhost:3000/auth/verify-email?email=...&token=..."
}
```

---

## Integration with Email Service

### To Enable Email Sending:

**1. Choose Email Provider**
- SendGrid (recommended for scale)
- Resend (modern React email builder)
- Nodemailer (self-hosted)
- AWS SES (enterprise)

**2. Create Email Template**

Example verification email:
```html
<h1>Verify Your Email</h1>
<p>Hi {{firstName}},</p>
<p>Click the link below to verify your email:</p>
<a href="{{verificationLink}}">Verify Email</a>
<p>This link expires in 24 hours.</p>
```

**3. Create `/lib/email/send.ts`**

```typescript
export async function sendVerificationEmail(
  email: string,
  firstName: string,
  verificationLink: string
) {
  // Use your email provider's API
  // Example with SendGrid:
  
  const msg = {
    to: email,
    from: process.env.SMTP_FROM_EMAIL,
    subject: 'Verify your MixxFactory email',
    html: `
      <h1>Welcome to MixxFactory!</h1>
      <p>Hi ${firstName},</p>
      <p><a href="${verificationLink}">Click here to verify your email</a></p>
      <p>This link expires in 24 hours.</p>
    `,
  };
  
  await sendgrid.send(msg);
}
```

**4. Uncomment Email Sending Code**

In `/app/api/auth/register/route.ts`, uncomment:
```typescript
// Uncomment when email service is configured:
// const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?email=${encodeURIComponent(email)}&token=${verificationToken}`;
// await sendVerificationEmail(email, user.firstName, verificationUrl);
```

In `/app/api/auth/resend-verification/route.ts`, uncomment:
```typescript
// const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?email=${encodeURIComponent(email)}&token=${token}`;
// await sendVerificationEmail(email, user.firstName, verificationUrl);
```

**5. Add Environment Variables**
```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_key
SMTP_FROM_EMAIL=noreply@mixxfactory.com
```

---

## Testing Without Email Service

### Test in Development:

**1. Register User**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123",
    "role": "user"
  }'
```

**Response includes verification link:**
```json
{
  "verificationLink": "http://localhost:3000/auth/verify-email?email=test@example.com&token=abc123..."
}
```

**2. Visit Link in Browser**
```
http://localhost:3000/auth/verify-email?email=test@example.com&token=abc123...
```

**3. Token Auto-Validates**
- Page loads and validates token
- Shows success message
- Redirects to login

**4. Verify in Database**
```bash
# Check user document
db.users.findOne({ email: "test@example.com" })

# Should show:
{
  emailVerified: true,
  emailVerificationToken: null,
  emailVerificationExpires: null
}
```

---

## Testing API Directly

### Verify Email Endpoint:
```bash
curl -X POST http://localhost:3000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "token": "token_from_registration_response"
  }'
```

### Resend Verification:
```bash
curl -X POST http://localhost:3000/api/auth/resend-verification \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

---

## Security Features

✅ **Token Security:**
- 32-byte random tokens (cryptographically secure)
- SHA256 hashed in database (never readable)
- 24-hour expiration
- Single-use (cleared after verification)
- Cannot be reused or guessed

✅ **Email Security:**
- User's email is verified before use
- Tokens tied to specific email
- Expired tokens auto-cleaned
- Email enumeration prevented (resend endpoint)

✅ **Account Security:**
- Users can login before verification (no lockout)
- Verification optional for existing accounts
- Admin account unaffected
- Backward compatible

---

## User Journey Examples

### Scenario 1: Successful Verification (Development)

1. User registers at `/auth/register`
2. Gets response with verification link
3. Clicks link directly (in development)
4. Email verified immediately
5. Redirects to login
6. Can now fully use verified account

### Scenario 2: Expired Token

1. User registered 25+ hours ago
2. Visits old verification link
3. Gets error: "Verification token has expired"
4. Clicks "Request New Link"
5. Visits `/auth/resend-verification`
6. Receives new token
7. Verifies email successfully

### Scenario 3: Production with Email Service

1. User registers
2. Receives verification email
3. Clicks email link
4. Browser navigates to verification page
5. Token auto-validates
6. Email marked verified
7. Redirects to login

---

## Database Schema

### User Document Fields:

```typescript
{
  email: string
  emailVerified: boolean (default: false)
  emailVerificationToken?: string (SHA256 hashed)
  emailVerificationExpires?: Date (24 hours from generation)
  
  // After verification:
  emailVerified: true
  emailVerificationToken: null
  emailVerificationExpires: null
}
```

### Token Generation:

```typescript
generateEmailVerificationToken() returns:
{
  token: string,           // 64-char hex (plain text)
  hashedToken: string,     // SHA256 (stored in DB)
  expiresAt: Date          // 24 hours from now
}
```

---

## Configuration Checklist

- [x] Email verification endpoints created
- [x] Verification pages created
- [x] Token generation in registration
- [x] Registration response includes verification link (dev)
- [ ] Email service integrated
- [ ] Environment variables configured
- [ ] Email templates created
- [ ] Verification email sending implemented
- [ ] Tested end-to-end

---

## Next Steps

**Immediate (To Go Live):**
1. ✅ Email verification system is ready
2. ⏳ Choose email service provider
3. ⏳ Create email templates
4. ⏳ Implement email sending in registration
5. ⏳ Test complete flow with real emails

**Optional (Future Enhancement):**
- Add verification reminder emails (if not verified in 7 days)
- Add verification success notification
- Add suspicious activity email alerts
- Integrate with email preference settings

---

## Troubleshooting

### "Invalid verification token"
- Check token is copied correctly (64 hex characters)
- Verify token hasn't been tampered with
- Token is tied to specific email (case-insensitive)

### "Verification token has expired"
- Token valid for 24 hours only
- User must request new token via resend page
- Expired tokens are automatically deleted

### "User not found"
- Email doesn't exist in system
- User already deleted account
- Check email spelling

### "Email is already verified"
- This is not an error, user can login
- Page shows this as success message
- No further action needed

---

## Production Deployment

**Before deploying to production:**

1. **Configure Email Service**
   - Set up SendGrid/Resend/etc account
   - Get API keys
   - Configure SMTP settings

2. **Update Environment Variables**
   ```
   SMTP_HOST=your_host
   SMTP_PORT=587
   SMTP_USER=your_user
   SMTP_PASSWORD=your_password
   SMTP_FROM_EMAIL=noreply@mixxfactory.com
   ```

3. **Enable Email Sending**
   - Uncomment email sending code
   - Test with real email address
   - Verify emails arrive in inbox

4. **Test Complete Flow**
   - Register test user
   - Receive verification email
   - Click link in email
   - Verify email marked as verified

5. **Monitor**
   - Check email delivery success rate
   - Monitor verification completion rate
   - Alert on email service failures

---

**Status:** ✅ Implementation Complete  
**Date:** January 2024  
**Ready for Email Service Integration:** Yes  
**Production Ready:** Yes (without email sending)

