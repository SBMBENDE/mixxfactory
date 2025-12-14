// API Documentation - Authentication & OAuth

## Authentication System Overview

The MixxFactory PWA includes a comprehensive authentication system with:
- **Email/Password Registration & Login**
- **Social Authentication** (Google & Facebook OAuth2)
- **Password Recovery** (token-based reset)
- **Profile Completion Tracking** (onboarding)
- **Account Preferences & Settings**
- **JWT-based Session Management**

---

## OAuth2 Setup Instructions

### Google OAuth Configuration

1. **Create OAuth Application**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project
   - Enable OAuth 2.0 Consent Screen
   - Create OAuth 2.0 Credentials (Web application)

2. **Configure Redirect URIs**
   - Development: `http://localhost:3000/api/auth/oauth/google/callback`
   - Production: `https://yourdomain.com/api/auth/oauth/google/callback`

3. **Add Environment Variables**
   ```
   GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   ```

### Facebook OAuth Configuration

1. **Create Facebook App**
   - Go to [Facebook Developers](https://developers.facebook.com)
   - Create a new app (type: Consumer)
   - Add "Facebook Login" product

2. **Configure Valid OAuth URIs**
   - Development: `http://localhost:3000/api/auth/oauth/facebook/callback`
   - Production: `https://yourdomain.com/api/auth/oauth/facebook/callback`

3. **Add Environment Variables**
   ```
   FACEBOOK_APP_ID=your_app_id_here
   FACEBOOK_APP_SECRET=your_app_secret_here
   ```

4. **Configure App Domains**
   - In Facebook App Settings, add your domain to "App Domains"
   - Go to Facebook Login settings and add redirect URIs

---

## Authentication API Endpoints

### Registration
**POST** `/api/auth/register`

Request:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "confirmPassword": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "accountType": "user"
}
```

Response:
```json
{
  "message": "Registration successful",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "accountType": "user",
    "emailVerified": false,
    "profileCompletionPercentage": 50
  }
}
```

### Login
**POST** `/api/auth/login`

Request:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

Response:
```json
{
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "accountType": "user"
  }
}
```

Sets JWT token in `auth_token` httpOnly cookie (7 days expiry)

### Google OAuth Login
**GET** `/api/auth/oauth/google/login`

Redirects user to Google consent screen. After consent, redirects to:
`/api/auth/oauth/google/callback?code=...&state=...`

**Automatic Actions:**
- Creates new user if email doesn't exist
- Links OAuth to existing account (if email matches)
- Sets auth cookie
- Redirects to `/dashboard`

### Facebook OAuth Login
**GET** `/api/auth/oauth/facebook/login`

Same flow as Google OAuth, but via Facebook. Requires:
- User to grant email permission
- Valid Facebook app configuration

### Forgot Password
**POST** `/api/auth/forgot-password`

Request:
```json
{
  "email": "user@example.com"
}
```

Response:
```json
{
  "message": "If an account exists with this email, a password reset link has been sent."
}
```

**In Development Mode:**
Returns reset token in response for testing:
```json
{
  "message": "...",
  "token": "64_char_hex_string",
  "expiresAt": "2024-01-01T12:00:00Z"
}
```

### Reset Password
**POST** `/api/auth/reset-password`

Request:
```json
{
  "email": "user@example.com",
  "token": "reset_token_from_email",
  "newPassword": "newSecurePassword123",
  "confirmPassword": "newSecurePassword123"
}
```

Response:
```json
{
  "message": "Password reset successful. You can now login with your new password."
}
```

### Get Current User
**GET** `/api/auth/me`

Response:
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "profilePicture": "https://...",
    "accountType": "user",
    "emailVerified": true,
    "oauthProvider": "google",
    "profileCompletion": {
      "basicInfo": true,
      "contactInfo": true,
      "profilePicture": false,
      "preferences": false
    },
    "profileCompletionPercentage": 75,
    "preferences": {
      "emailNotifications": true,
      "smsNotifications": false,
      "marketingEmails": false,
      "language": "en",
      "theme": "light",
      "twoFactorEnabled": false
    },
    "active": true,
    "lastLogin": "2024-01-01T12:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Update Preferences
**PATCH** `/api/auth/preferences`

Request:
```json
{
  "emailNotifications": false,
  "language": "fr",
  "theme": "dark",
  "twoFactorEnabled": true
}
```

Response:
```json
{
  "message": "Preferences updated successfully",
  "preferences": {
    "emailNotifications": false,
    "smsNotifications": false,
    "marketingEmails": false,
    "twoFactorEnabled": true,
    "language": "fr",
    "theme": "dark"
  }
}
```

### Get User Profile
**GET** `/api/users/profile`

Response:
```json
{
  "user": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "profilePicture": "https://...",
    "email": "user@example.com",
    "accountType": "user",
    "profileCompletion": {
      "basicInfo": true,
      "contactInfo": true,
      "profilePicture": false,
      "preferences": false
    },
    "profileCompletionPercentage": 75
  }
}
```

### Update User Profile
**PATCH** `/api/users/profile`

Request:
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+9876543210",
  "profilePicture": "https://cloudinary.com/..."
}
```

Response:
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "user_id",
    "firstName": "Jane",
    "lastName": "Smith",
    "phone": "+9876543210",
    "profilePicture": "https://cloudinary.com/...",
    "profileCompletion": {
      "basicInfo": true,
      "contactInfo": true,
      "profilePicture": true,
      "preferences": false
    },
    "profileCompletionPercentage": 100
  }
}
```

---

## Security Features

1. **Password Security**
   - Minimum 8 characters required
   - Hashed with bcryptjs (10 salt rounds)
   - Never returned in API responses

2. **Token Management**
   - JWT tokens in httpOnly cookies (cannot be accessed by JavaScript)
   - 7-day expiration
   - Secure flag on production (HTTPS only)
   - SameSite=lax to prevent CSRF

3. **Reset Tokens**
   - 32-byte random tokens (SHA256 hashed)
   - 1-hour expiration for password reset
   - 24-hour expiration for email verification
   - Single-use (cleared after successful reset)

4. **OAuth Security**
   - State parameter for CSRF protection
   - Automatic user creation with verified email from provider
   - Account linking for existing users (same email)
   - Immediate password clear for OAuth-only accounts

5. **Rate Limiting** (Recommended to add)
   - Implement on login/register to prevent brute force
   - Implement on password reset to prevent spam
   - Lock account after 5 failed login attempts (already tracked)

---

## Frontend Integration Guide

### Login with Email/Password
```typescript
async function login(email: string, password: string) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Include cookies
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  return data;
}
```

### Google Login Button
```typescript
<a href="/api/auth/oauth/google/login" className="google-login-btn">
  Sign in with Google
</a>
```

### Facebook Login Button
```typescript
<a href="/api/auth/oauth/facebook/login" className="facebook-login-btn">
  Sign in with Facebook
</a>
```

### Get Current User
```typescript
async function getCurrentUser() {
  const response = await fetch('/api/auth/me', {
    credentials: 'include'
  });
  const data = await response.json();
  return data.user;
}
```

### Update Preferences
```typescript
async function updatePreferences(preferences: any) {
  const response = await fetch('/api/auth/preferences', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(preferences)
  });
  const data = await response.json();
  return data;
}
```

### Update Profile
```typescript
async function updateProfile(profileData: any) {
  const response = await fetch('/api/users/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(profileData)
  });
  const data = await response.json();
  return data;
}
```

---

## Next Steps: Email Service Integration

When ready to enable actual email sending:

1. **Choose Email Provider**
   - SendGrid (Recommended for scale)
   - Resend (Modern, React email builder)
   - Nodemailer (Self-hosted)
   - AWS SES (Enterprise)

2. **Environment Variables to Add**
   ```
   SMTP_HOST=smtp.service.com
   SMTP_PORT=587
   SMTP_USER=your_email
   SMTP_PASSWORD=your_password
   SMTP_FROM_EMAIL=noreply@mixxfactory.com
   ```

3. **Create Email Templates**
   - Password reset email
   - Email verification email
   - Welcome email
   - Account activity alerts

4. **Update `forgot-password` Endpoint**
   - Uncomment email sending code
   - Generate reset URL
   - Send email with reset link

5. **Add Email Verification Flow**
   - Send verification email on registration
   - Create `/api/auth/verify-email` endpoint
   - Track email verification status

---

## Database Schema

### User Document Structure
```typescript
{
  email: string (unique, indexed)
  password?: string (hashed, not returned by default)
  firstName: string
  lastName: string
  phone?: string
  profilePicture?: string (Cloudinary URL)
  accountType: 'user' | 'professional' | 'admin'
  
  // OAuth
  oauthProvider?: 'google' | 'facebook'
  oauthId?: string
  
  // Profile Completion
  profileCompletion: {
    basicInfo: boolean
    contactInfo: boolean
    profilePicture: boolean
    preferences: boolean
  }
  profileCompletionPercentage: number (0-100)
  
  // Preferences
  preferences: {
    emailNotifications: boolean
    smsNotifications: boolean
    marketingEmails: boolean
    twoFactorEnabled: boolean
    language: 'en' | 'fr'
    theme: 'light' | 'dark'
  }
  
  // Email & Password Recovery
  emailVerified: boolean
  emailVerificationToken?: string (hashed)
  emailVerificationExpires?: Date
  passwordResetToken?: string (hashed)
  passwordResetExpires?: Date
  
  // Account Status
  active: boolean
  lastLogin?: Date
  loginAttempts: number
  lockUntil?: Date (for failed login locking)
  
  createdAt: Date
  updatedAt: Date
}
```

---

## Testing Checklist

- [ ] Email/password registration works
- [ ] Email/password login works
- [ ] Google OAuth login creates/links user
- [ ] Facebook OAuth login creates/links user
- [ ] Password reset email sent (in dev mode)
- [ ] Reset token validation works
- [ ] Password update successful
- [ ] Profile completion tracking accurate
- [ ] Preferences save correctly
- [ ] Profile picture update works
- [ ] Language/theme preference persists
- [ ] OAuth state validation prevents CSRF
- [ ] Account locking after failed attempts works
- [ ] JWT token expiration works
- [ ] Logout clears cookie

---

**Last Updated:** January 2024  
**Status:** Implementation Complete (Ready for Email Service Integration)
