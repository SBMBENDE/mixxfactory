/**
 * Phase 1 Testing Checklist
 * Email Notifications & Professional Profile Enhancements
 */

# Phase 1 - Complete Testing Guide

## ✅ Email System Testing

### Newsletter Subscription Confirmation Email
**Location**: Home page newsletter signup
**Steps to Test**:
1. Navigate to home page
2. Scroll to newsletter section
3. Enter test email: `test@example.com`
4. Click "Subscribe"
5. **Expected Result**: 
   - Success message: "Check your email for confirmation"
   - Email received with subject: "Welcome to MixxFactory Newsletter"
   - Email includes: welcome message, what to expect, unsubscribe link
   - Subscriber appears in admin dashboard: Dashboard → Newsletter

### Professional Registration Welcome Email
**Location**: Professional registration page
**Steps to Test**:
1. Go to `/register/professional`
2. Fill in form with test data:
   - Name: Test DJ Pro
   - Category: DJ
   - Email: `pro@example.com`
   - Password: secure123
3. Submit form
4. **Expected Result**:
   - Account created successfully
   - Email received with subject: "Welcome to MixxFactory Pro"
   - Email includes: getting started tips, profile completion guide

---

## ✅ Professional Profile Fields Testing

### Gallery Upload Component
**Location**: Admin Dashboard → Professionals → [Select Professional] → Portfolio Gallery
**Steps to Test**:
1. Log in as admin
2. Go to Dashboard
3. Click "Professionals"
4. Click on any professional to edit
5. Scroll to "Portfolio Gallery" section
6. **Test Upload**:
   - Click upload area or drag images
   - Select 3-5 test images (JPG/PNG)
   - Verify: Images appear in grid with index numbers
   - Verify: Upload indicator shows progress
   - Success message: "Added X image(s)"

7. **Test Reordering**:
   - Hover over an image
   - Click up/down arrows to reorder
   - Verify: Images swap positions
   - Verify: Index numbers update

8. **Test Deletion**:
   - Hover over an image
   - Click "Delete" button
   - Verify: Image removed from gallery
   - Success message: Gallery updated

### Bio Field
**Location**: Admin Dashboard → Professionals → [Select Professional] → Profile Settings → Professional Bio
**Steps to Test**:
1. In professional edit page, scroll to "Profile Settings"
2. Click on "Professional Bio" textarea
3. Enter test bio: "Award-winning DJ with 10+ years experience"
4. Click outside textarea (blur event triggers save)
5. **Expected Result**:
   - Bio saves automatically on blur
   - Success message: "Bio updated"
   - Bio displays on professional detail page

### Verification Badge Control
**Location**: Admin Dashboard → Professionals → [Select Professional] → Profile Settings → Verification Badge
**Steps to Test**:
1. In same "Profile Settings" section
2. Find toggle button next to "Verification Badge"
3. **Test Enable**:
   - Click toggle (should turn green)
   - Success message: "Professional verified ✓"
   - Green confirmation box appears

4. **Test Disable**:
   - Click toggle again (should turn gray)
   - Success message: "Verification removed"

5. **Verify on Detail Page**:
   - Navigate to professional detail page: `/professionals/[slug]`
   - **Expected**: Green "✓ Verified" badge appears next to category tag

---

## ✅ Professional Detail Page Display Testing

### Verification Badge Display
**Location**: Professional detail page `/professionals/[slug]`
**Steps to Test**:
1. As admin, enable verification for a professional
2. Navigate to professional detail page
3. **Expected**:
   - Green "✓ Verified" badge visible next to "Featured" badge if applicable
   - Badge styling: green background (#dcfce7), green text (#15803d)

### Bio Display
**Location**: Same professional detail page
**Steps to Test**:
1. Professional must have bio filled in
2. On detail page, scroll below "About" section
3. **Expected**:
   - "Bio" section appears with bio text
   - Text preserves line breaks and formatting

### Portfolio Gallery Display
**Location**: Same professional detail page
**Steps to Test**:
1. Professional must have gallery images
2. On detail page, scroll below contact section (before Reviews)
3. **Expected**:
   - "Portfolio Gallery" section shows grid of images
   - Hover on images: slight zoom effect (scale 1.05)
   - Click images: opens in new tab
   - Grid is responsive (1 column mobile, 2-3 on tablet, 4 on desktop)

---

## ✅ End-to-End Integration Testing

### Complete Professional Workflow
**Steps**:
1. Register new professional account → verify welcome email received
2. Edit professional profile:
   - Add bio
   - Upload 5 gallery images
   - Save all changes
3. As admin, enable verification badge
4. View public profile → verify all three new features display correctly:
   - ✓ Verified badge
   - Bio section with content
   - Portfolio gallery with images

### Complete Newsletter Workflow
**Steps**:
1. Subscribe to newsletter → verify confirmation email
2. As admin, create news flash: Dashboard → Newsletter
3. Publish news flash
4. View home page → verify news flash appears on banner
5. Unsubscribe link from email → verify works

---

## ✅ Error Handling Testing

### Gallery Upload Errors
1. **Large file**: Try uploading file > 10MB
   - Expected: Error message displayed
   
2. **Wrong file type**: Try uploading .pdf or .txt
   - Expected: Only image files accepted

3. **Network error**: 
   - Open DevTools Network tab
   - Upload image
   - Throttle connection to offline
   - Expected: Error message, graceful failure

### API Errors
1. **Unauthorized access**: Try accessing admin professional edit as non-admin
   - Expected: Redirect to login or error message

2. **Invalid data**: 
   - Try setting gallery to non-array value
   - Expected: Validation error in console

---

## ✅ Database Verification

### Check Saved Data
```bash
# In project root:
node -e "
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  const professionals = await db.collection('professionals').find({}).limit(1).toArray();
  console.log('Professional Sample:', JSON.stringify(professionals[0], null, 2));
});
"
```

**Expected fields**:
- `gallery: [String]` - Array of image URLs
- `verified: Boolean` - Verification status
- `bio: String` - Biographical text

---

## ✅ Performance Testing

### Image Upload Performance
- **< 3 seconds**: Single image upload
- **< 10 seconds**: 5 image upload
- **Gallery display**: < 1 second to render grid

### Page Load Performance
- **Professional edit page**: < 2 seconds to load
- **Professional detail page**: < 2 seconds to load with gallery

---

## 🎯 Final Verification Checklist

- [ ] Newsletter subscription email sends automatically
- [ ] Professional registration email sends automatically
- [ ] Gallery images upload successfully
- [ ] Gallery images reorder and delete
- [ ] Bio saves on blur event
- [ ] Verification toggle works (enable/disable)
- [ ] Verification badge displays on detail page
- [ ] Bio displays on detail page with formatting
- [ ] Portfolio gallery displays with responsive grid
- [ ] All images in gallery link to external source
- [ ] Error messages display for failures
- [ ] No console errors in browser DevTools
- [ ] Mobile responsiveness works (test on mobile device or DevTools)
- [ ] Dark mode works (toggle theme in navbar)

---

## 📝 Test Data Recommendations

### Sample Images
- Use images from: https://unsplash.com/ or https://picsum.photos/
- Recommended sizes: 800x600px, 1200x800px
- Formats: JPG, PNG

### Sample Email Addresses
- Newsletter: `newsletter@test.com`, `subscriber@test.com`
- Professional: `dj@test.com`, `stylist@test.com`

### Sample Bio Text
```
Award-winning DJ with 10+ years of experience in weddings, corporate events, and nightclubs. 
Specializing in electronic dance music and 90s nostalgia. Available for bookings worldwide.
```

---

**Status**: Ready for Testing
**Version**: Phase 1 - Complete
**Last Updated**: December 2025
