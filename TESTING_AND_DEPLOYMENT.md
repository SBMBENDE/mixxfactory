/**
 * Authentication System Testing & Deployment Checklist
 */

# Authentication System - Testing & Deployment Guide

## Pre-Deployment Checklist

### Environment Configuration
- [ ] MongoDB URI is correctly configured in `.env.local`
- [ ] JWT_SECRET is set to a minimum of 32 characters
- [ ] All required OAuth credentials are added:
  - [ ] GOOGLE_CLIENT_ID
  - [ ] GOOGLE_CLIENT_SECRET
  - [ ] FACEBOOK_APP_ID
  - [ ] FACEBOOK_APP_SECRET
- [ ] NEXT_PUBLIC_APP_URL is set correctly for environment
- [ ] NODE_ENV is set to 'production' for production deployments

### Database Verification
- [ ] MongoDB Atlas network access includes deployment IP
- [ ] User collection indexes are created:
  ```
  db.users.createIndex({ "email": 1 }, { "unique": true })
  db.users.createIndex({ "oauthProvider": 1, "oauthId": 1 })
  db.users.createIndex({ "emailVerified": 1, "active": 1 })
  db.users.createIndex({ "accountType": 1, "profileCompletionPercentage": -1 })
  ```
- [ ] Sample test user created and verified

### OAuth Provider Setup Verification
- [ ] **Google:**
  - [ ] OAuth consent screen is configured
  - [ ] Redirect URIs are added to Google Cloud Console
  - [ ] Client ID and Secret are correctly copied
  - [ ] Test login attempted in development environment
  
- [ ] **Facebook:**
  - [ ] App is in development/live mode
  - [ ] Redirect URIs are added to Facebook App Settings
  - [ ] Email permission is requested in app
  - [ ] App ID and Secret are correctly copied
  - [ ] Test login attempted in development environment

---

## Functional Testing

### Email/Password Authentication
**Test Case 1: User Registration**
```bash
# Request:
POST /api/auth/register
Content-Type: application/json

{
  "email": "testuser@example.com",
  "password": "TestPassword123",
  "confirmPassword": "TestPassword123",
  "firstName": "Test",
  "lastName": "User",
  "accountType": "user"
}

# Expected Response: 201
{
  "message": "Registration successful",
  "user": {
    "id": "...",
    "email": "testuser@example.com",
    "firstName": "Test",
    "lastName": "User",
    "profileCompletionPercentage": 50
  }
}

# Verify:
- [ ] User created in MongoDB
- [ ] Password is hashed (not readable in DB)
- [ ] HTTP-only auth_token cookie is set
- [ ] JWT token contains correct user data
```

**Test Case 2: User Login**
```bash
# Request:
POST /api/auth/login
Content-Type: application/json

{
  "email": "testuser@example.com",
  "password": "TestPassword123"
}

# Expected Response: 200
{
  "message": "Login successful",
  "user": {
    "id": "...",
    "email": "testuser@example.com"
  }
}

# Verify:
- [ ] Correct credentials work
- [ ] Wrong password returns 401
- [ ] Non-existent email returns 401
- [ ] auth_token cookie is set
- [ ] lastLogin timestamp is updated
- [ ] loginAttempts is reset to 0
```

**Test Case 3: Invalid Registration**
```bash
# Request: Missing password confirmation
POST /api/auth/register
{
  "email": "testuser@example.com",
  "password": "TestPassword123",
  "confirmPassword": "DifferentPassword",
  "firstName": "Test",
  "lastName": "User"
}

# Expected Response: 400
{
  "error": "Validation failed",
  "details": {
    "confirmPassword": ["Passwords don't match"]
  }
}

# Additional Validations:
- [ ] Email is invalid → 400 error
- [ ] Password < 8 chars → 400 error
- [ ] Email already exists → 409 error
- [ ] Missing required fields → 400 error
```

### Google OAuth Flow
**Test Case 1: Google Login Initiation**
```bash
# Request:
GET /api/auth/oauth/google/login

# Expected:
- [ ] Redirects to Google consent screen
- [ ] State parameter is stored in cookie
- [ ] State cookie expires after 10 minutes
```

**Test Case 2: Google Callback**
```bash
# Simulate callback:
GET /api/auth/oauth/google/callback?code=auth_code&state=state_param

# Verify:
- [ ] State parameter is validated
- [ ] User is created if new
- [ ] User is updated if existing (same email)
- [ ] auth_token cookie is set
- [ ] Redirects to /dashboard
- [ ] OAuth data is stored (oauthProvider, oauthId)
```

**Test Case 3: Google OAuth Error Handling**
```bash
# Request with error:
GET /api/auth/oauth/google/callback?error=access_denied

# Expected:
- [ ] Redirects to /auth/login?error=oauth_failed
- [ ] Error message is displayed
- [ ] User is NOT created
```

### Facebook OAuth Flow
**Test Case 1: Facebook Login Initiation**
```bash
# Request:
GET /api/auth/oauth/facebook/login

# Expected:
- [ ] Redirects to Facebook login
- [ ] State parameter is stored in cookie
```

**Test Case 2: Facebook Callback**
```bash
# Simulate callback:
GET /api/auth/oauth/facebook/callback?code=auth_code&state=state_param

# Verify:
- [ ] Email permission is required
- [ ] User profile is fetched correctly
- [ ] Profile picture is included
- [ ] User is created with Facebook data
- [ ] OAuth linking works for existing users
```

### Password Recovery Flow
**Test Case 1: Forgot Password**
```bash
# Request:
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "testuser@example.com"
}

# Expected Response: 200
{
  "message": "If an account exists with this email, a password reset link has been sent.",
  // In development:
  "token": "64_char_hex_string",
  "expiresAt": "2024-01-01T12:00:00Z"
}

# Verify:
- [ ] Non-existent email doesn't reveal error (security)
- [ ] Token is 64 character hex string
- [ ] Token expires after 1 hour
- [ ] Token is hashed in database (not plain text)
```

**Test Case 2: Password Reset**
```bash
# Request:
POST /api/auth/reset-password
Content-Type: application/json

{
  "email": "testuser@example.com",
  "token": "reset_token",
  "newPassword": "NewPassword123",
  "confirmPassword": "NewPassword123"
}

# Expected Response: 200
{
  "message": "Password reset successful..."
}

# Verify:
- [ ] Old password no longer works
- [ ] New password works
- [ ] Token cannot be reused
- [ ] Expired token is rejected
- [ ] Invalid token is rejected
```

### Profile Management
**Test Case 1: Get Current User**
```bash
# Request:
GET /api/auth/me
Cookie: auth_token=...

# Expected Response: 200
{
  "user": {
    "id": "...",
    "email": "...",
    "firstName": "...",
    "profileCompletionPercentage": 50,
    "preferences": {...}
  }
}

# Verify:
- [ ] Without auth_token → 401
- [ ] Invalid token → 401
- [ ] Correct user data is returned
```

**Test Case 2: Update Profile**
```bash
# Request:
PATCH /api/users/profile
Cookie: auth_token=...
Content-Type: application/json

{
  "firstName": "Updated",
  "phone": "+1234567890",
  "profilePicture": "https://example.com/pic.jpg"
}

# Expected Response: 200
{
  "message": "Profile updated successfully",
  "user": {
    "profileCompletionPercentage": 100,
    ...
  }
}

# Verify:
- [ ] Fields are updated
- [ ] profileCompletionPercentage is recalculated
- [ ] basicInfo is marked true when name changes
- [ ] contactInfo is marked true when phone changes
- [ ] profilePicture is marked true when picture changes
```

**Test Case 3: Update Preferences**
```bash
# Request:
PATCH /api/auth/preferences
Cookie: auth_token=...
Content-Type: application/json

{
  "language": "fr",
  "theme": "dark",
  "emailNotifications": false
}

# Expected Response: 200
{
  "message": "Preferences updated successfully",
  "preferences": {...}
}

# Verify:
- [ ] All preference fields are updated
- [ ] Invalid enum values are rejected
- [ ] Preferences persist on re-fetch
```

---

## Security Testing

### Password Security
```bash
# Test 1: Password hashing
- [ ] Passwords in database are not readable
- [ ] Same password produces different hashes
- [ ] bcrypt with 10 rounds is used

# Test 2: Password requirements
- [ ] Minimum 8 characters enforced
- [ ] Passwords not returned in API responses
- [ ] Password never logged in server
```

### Token Security
```bash
# Test 1: JWT Security
- [ ] auth_token is httpOnly (cannot be read by JavaScript)
- [ ] auth_token is secure flag (HTTPS only in production)
- [ ] auth_token has SameSite=lax
- [ ] Token expires after 7 days

# Test 2: Token Validation
- [ ] Invalid tokens are rejected
- [ ] Expired tokens are rejected
- [ ] Tampered tokens are rejected
```

### OAuth Security
```bash
# Test 1: State Parameter
- [ ] State is generated for each OAuth request
- [ ] State is validated on callback
- [ ] Different state values are rejected

# Test 2: Account Linking
- [ ] OAuth can link to existing account by email
- [ ] Email verification is required when linking
```

### Data Validation
```bash
# Test 1: Input Validation
- [ ] Invalid emails are rejected
- [ ] SQL injection attempts are handled
- [ ] XSS attempts in input are escaped
- [ ] File uploads are size-limited

# Test 2: Rate Limiting (Recommended)
- [ ] Multiple failed logins lock account
- [ ] Password reset attempts are throttled
- [ ] Registration attempts have rate limit
```

---

## Performance Testing

### Database Query Performance
```bash
# Verify indexes exist:
db.users.getIndexes()

# Should include:
- [ ] email: 1 (unique)
- [ ] oauthProvider: 1, oauthId: 1
- [ ] emailVerified: 1, active: 1
- [ ] accountType: 1, profileCompletionPercentage: -1
```

### Load Testing
```bash
# Test concurrent registrations:
# - [ ] 100 concurrent requests complete successfully
# - [ ] Response time < 500ms per request
# - [ ] No database deadlocks

# Test concurrent logins:
# - [ ] 100 concurrent requests complete successfully
# - [ ] Response time < 300ms per request
```

---

## Browser Compatibility Testing

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Browsers
- [ ] iOS Safari
- [ ] Chrome Android
- [ ] Samsung Internet

### Features to Test on Each
- [ ] Login form submission
- [ ] OAuth button clicks
- [ ] Responsive layout
- [ ] Dark mode toggle
- [ ] Cookie handling

---

## Production Deployment Checklist

### Pre-Deployment
- [ ] All tests pass locally
- [ ] No console errors in browser
- [ ] Environment variables are configured
- [ ] Database backups are created
- [ ] Rollback plan is documented

### Deployment Steps
```bash
# 1. Merge to main branch
# 2. Test on staging environment
npm run build
npm run start

# 3. Verify OAuth redirects work on staging
# 4. Verify database connections
# 5. Deploy to production
# 6. Verify OAuth providers are configured for production domain
# 7. Test complete authentication flow in production
# 8. Monitor error logs for 24 hours
```

### Post-Deployment
- [ ] Google OAuth login works in production
- [ ] Facebook OAuth login works in production
- [ ] Email/password login works in production
- [ ] Password reset flow works
- [ ] Profile updates are saved
- [ ] PWA install prompt works
- [ ] No errors in Sentry/error tracking
- [ ] Analytics show user signups

---

## Monitoring & Maintenance

### Critical Metrics to Monitor
- [ ] Authentication error rate (should be < 1%)
- [ ] OAuth provider availability
- [ ] JWT token validation success rate
- [ ] Password reset email delivery (when email service is added)
- [ ] Failed login attempts (for account locking)

### Regular Maintenance Tasks
- [ ] Review JWT_SECRET age (rotate if > 1 year)
- [ ] Check OAuth credentials expiration dates
- [ ] Monitor database index usage
- [ ] Review authentication logs for suspicious activity
- [ ] Update dependencies monthly

### Alerts to Set Up
- [ ] Authentication endpoint error rate > 5%
- [ ] OAuth provider downtime
- [ ] Database connection failures
- [ ] Failed login attempts > 10 per minute from same IP
- [ ] Unusual password reset patterns

---

## Troubleshooting Guide

### Issue: "OAuth configuration not found"
**Solution:** Verify environment variables are set and server is restarted

### Issue: "Invalid or expired reset token"
**Solution:** Token expires after 1 hour, user must request new one

### Issue: "Email already registered"
**Solution:** OAuth linking requires same email, ask user to login with OAuth or use forgot password

### Issue: "MongoDB connection failed"
**Solution:** Check MONGODB_URI format, verify network access in Atlas console

### Issue: "Profile picture not updating"
**Solution:** Ensure URL is valid and accessible. Test with Cloudinary URL.

### Issue: "Dark mode not persisting"
**Solution:** Verify preferences endpoint is called, check browser storage settings

---

## Email Service Integration (Future)

When ready to add email functionality:

1. **Choose Provider:** SendGrid (recommended), Resend, or Nodemailer
2. **Add Environment Variables:** SMTP credentials
3. **Uncomment Code:** In `/app/api/auth/forgot-password/route.ts`
4. **Create Email Templates:** Password reset, verification
5. **Test Email Delivery:** Send test emails from staging
6. **Enable in Production:** Update forgot-password endpoint to send emails

---

## API Response Status Codes Reference

| Code | Scenario | Example |
|------|----------|---------|
| 200 | Successful operation | Login, preferences update |
| 201 | Resource created | User registration |
| 400 | Validation error | Invalid email format |
| 401 | Authentication required | Missing auth token |
| 409 | Resource conflict | Email already exists |
| 500 | Server error | Database connection failed |

---

**Last Updated:** January 2024  
**Next Review:** When email service is integrated
