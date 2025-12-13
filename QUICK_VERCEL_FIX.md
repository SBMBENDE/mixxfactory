## Vercel Environment Variables Checklist

### Current Status
✅ Data confirmed in MongoDB
- 2 professionals: DjSaMM (5 images), Sam Mbende (6 images)
- 2 reviews saved
- 5+ categories
- All images stored (base64 + Cloudinary URLs)

❌ Problem: Data not visible on https://mixxfactory.vercel.app

### To Fix (Do These Now):

**1. Vercel Environment Variables**
- [ ] Go to https://vercel.com/dashboard/project/mixxfactory/settings/environment-variables
- [ ] Add `MONGODB_URI` = Your MongoDB connection string
- [ ] Add `JWT_SECRET` = 6a3999d3ea25ed587b7d9a477a92f14eb7213a33e4daeca648d4dc25abac5c0c
- [ ] Add `NEXT_PUBLIC_APP_URL` = https://mixxfactory.vercel.app
- [ ] Add Cloudinary variables (NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)

**2. MongoDB Network Access**
- [ ] Go to https://cloud.mongodb.com/v2
- [ ] Select Cluster0
- [ ] Go to Network Access
- [ ] Ensure `0.0.0.0/0` (Allow Anywhere) is enabled

**3. Redeploy**
```bash
git add .
git commit -m "Add Vercel environment configuration"
git push origin main
```

**4. Test**
- [ ] Wait for Vercel build to complete (~2 min)
- [ ] Visit https://mixxfactory.vercel.app/directory
- [ ] Verify your 2 professionals show up
- [ ] Click on a professional to see images

### Expected Result After Fix
✅ professionals showing on directory page
✅ images displaying
✅ reviews accessible
✅ admin dashboard working

### Debug Commands (If Still Not Working)
```bash
# Check Vercel logs
npm install -g vercel
vercel login
vercel logs mixxfactory --follow

# Or test API directly
curl https://mixxfactory.vercel.app/api/professionals
```

### Contact Support
If data still doesn't show:
1. Check Vercel logs for errors
2. Verify API returns data: https://mixxfactory.vercel.app/api/professionals
3. Check MongoDB connection is working
