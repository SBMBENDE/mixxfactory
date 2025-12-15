# Vercel Data Sync - Diagnostic & Fix Guide

## Status Summary
✅ **Good News**: Your data IS in MongoDB!
- 2 professionals with 11 images total
- 2 reviews saved
- All categories present

❌ **Issue**: Vercel production site is not showing this data

## Root Cause Analysis

Vercel needs environment variables to connect to MongoDB. The most common reasons for data not appearing:

1. **Environment variables not set on Vercel**
2. **MONGODB_URI not configured on Vercel**
3. **MongoDB Atlas network access blocking Vercel IP**
4. **Stale cache from old deployment**

## Fix Steps

### Step 1: Set Environment Variables on Vercel

1. Go to: https://vercel.com/dashboard
2. Click on your **mixxfactory** project
3. Go to **Settings** > **Environment Variables**
4. Add these variables:

**Variable 1: MONGODB_URI**
- Key: `MONGODB_URI`
- Value: `mongodb+srv://username:password@cluster.mongodb.net/mixxfactory?retryWrites=true&w=majority`
- Environments: Production, Preview, Development

**Variable 2: JWT_SECRET**
- Key: `JWT_SECRET`
- Value: `6a3999d3ea25ed587b7d9a477a92f14eb7213a33e4daeca648d4dc25abac5c0c`
- Environments: Production, Preview, Development

**Variable 3: NEXT_PUBLIC_APP_URL**
- Key: `NEXT_PUBLIC_APP_URL`
- Value: `https://mixxfactory.vercel.app`
- Environments: Production

**Variable 4-6: Cloudinary Variables**
- Key: `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- Value: `dkd3k6eau`
- Environments: All

- Key: `CLOUDINARY_API_KEY`
- Value: `614597129759869`
- Environments: All

- Key: `CLOUDINARY_API_SECRET`
- Value: `bmYd_MWcNZCWk0Daey9g6m_Q1Ig`
- Environments: All

### Step 2: Check MongoDB Network Access

1. Go to: https://cloud.mongodb.com
2. Sign in
3. Go to **Cluster0** > **Network Access**
4. Check if `0.0.0.0/0` (Allow Access from Anywhere) is enabled
5. If not, add it:
   - Click **Add IP Address**
   - Select **Allow Access from Anywhere**
   - Click **Confirm**

### Step 3: Redeploy to Vercel

Option A: Redeploy via Git
```bash
git add .
git commit -m "Configure Vercel environment variables for data sync"
git push
```

Option B: Redeploy via Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select **mixxfactory** project
3. Click **Deployments**
4. Find the latest deployment
5. Click **Redeploy**

### Step 4: Test the Connection

After deployment completes:

1. Visit: https://mixxfactory.vercel.app/directory
2. You should see your 2 professionals with images
3. Check: https://mixxfactory.vercel.app/admin/dashboard (login to see admin features)

### Step 5: Verify Data Display

Check what's showing:
- [ ] Professional listings on /directory
- [ ] Professional images displaying
- [ ] Professional details on individual pages
- [ ] Reviews section accessible

## Debugging Commands

### Check Vercel Logs
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Check deployment logs
vercel logs mixxfactory --follow
```

### Test API Endpoint Directly
1. Visit: `https://mixxfactory.vercel.app/api/professionals`
2. You should see JSON with your 2 professionals

### MongoDB Atlas Verification
1. Go to https://cloud.mongodb.com
2. Select your **mixxfactory** cluster
3. Click **Collections**
4. Verify:
   - `professionals` collection has 2 documents
   - `reviews` collection has 2 documents
   - `categories` collection has entries

## Common Issues & Solutions

### "Cannot connect to MongoDB"
- Check MONGODB_URI format in Vercel env vars
- Ensure MongoDB Atlas Network Access allows `0.0.0.0/0`
- Check if connection string has special characters (encode them properly)

### "No data displays, but API returns empty"
- Verify `active: true` flag on professionals
- Check if professionals have valid category IDs
- Ensure images array is properly formatted

### "Data shows on localhost but not Vercel"
- Confirm MONGODB_URI is identical in .env.local and Vercel
- Check that both point to same MongoDB database
- Force clear Vercel cache: redeploy with git push

### "Images not displaying"
- Verify Cloudinary URLs are valid
- Check NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is set
- Ensure remotePatterns in next.config.js includes Cloudinary domain

## Prevention Tips

1. Always set environment variables BEFORE deploying
2. Keep .env.local and Vercel env vars in sync
3. Use the same MongoDB URI for localhost and production
4. Test API endpoints after deployment
5. Monitor logs for errors: `vercel logs`

## Next Steps

1. ✅ Environment variables set on Vercel
2. ✅ Redeploy project
3. ✅ Test https://mixxfactory.vercel.app/directory
4. ✅ Verify data displays

If data still doesn't show after these steps, check Vercel logs for error messages.
