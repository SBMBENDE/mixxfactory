# Cloudinary Setup Guide for MixxFactory

## 🎯 Quick Setup (5 minutes)

### Step 1: Get Your Cloudinary Cloud Name
1. Log in to your Cloudinary account
2. Go to **Dashboard** (top right)
3. Copy your **Cloud Name** (looks like: `dxxxxx`)

### Step 2: Add to Environment Variables
Create/update `.env.local` in the root of your project:

```bash
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
```

Replace `your_cloud_name_here` with your actual cloud name.

### Step 3: Create Upload Preset (Important!)
1. Go to **Settings** → **Upload**
2. Scroll down to **Upload presets**
3. Click **Add upload preset**
4. Fill in:
   - **Name:** `mixxfactory`
   - **Mode:** Select **Unsigned** (important!)
   - Keep other settings as default
5. Click **Save**

### Step 4: Restart Development Server
```bash
npm run dev
```

That's it! File uploads are now enabled.

---

## 🚀 How It Works Now

### Upload Files Directly
1. Go to **Dashboard → Professionals**
2. Click **Edit** on any professional
3. Under "Method 2: Upload Files to Cloudinary"
4. Click **Select Files from Computer**
5. Choose images (supports PNG, JPG, GIF, WebP, etc.)
6. Click **Upload X File(s) to Cloudinary**
7. Images automatically:
   - Upload to Cloudinary's global CDN
   - Get optimized for web (smaller file size)
   - Load super fast worldwide
   - Return permanent URLs

### Paste URLs (Still Works)
Method 1 still works perfectly for external URLs (Imgur, unsplash, etc.)

---

## 📊 What Cloudinary Provides (FREE)

| Feature | FREE Tier |
|---------|-----------|
| Storage | 25 GB/month |
| Bandwidth | 25 GB/month |
| Transformations | Unlimited |
| Auto-optimization | Yes ✓ |
| Global CDN | Yes ✓ |
| Responsive images | Yes ✓ |
| Image quality | Auto-optimized |

---

## 🔒 Security Notes

- **Unsigned upload preset:** Safe for client-side uploads
- **No API keys exposed:** Cloud name is public-safe
- **File validation:** Server validates all uploads
- **Size limits:** Files capped at 10MB client-side

---

## 🐛 Troubleshooting

### "Upload preset not found" error
- Check upload preset name is exactly: `mixxfactory`
- Make sure mode is set to **Unsigned**

### "Cloud name not found" error
- Make sure `.env.local` has the correct cloud name
- Restart dev server after adding env variable
- Check spelling (case-sensitive)

### "Failed to upload" error
- File might be too large (max 10MB)
- Check file format is a valid image
- Try uploading one file at a time

### Button says "Configure Cloudinary"
- `.env.local` not set properly
- Dev server hasn't restarted
- Cloud name is incorrect

---

## 💾 File Format Support

✓ PNG
✓ JPG/JPEG
✓ GIF
✓ WebP
✓ SVG
✓ TIFF

---

## 🎨 Advanced Features (Optional)

### Custom Transformation
Images can be resized on-the-fly:
```
https://res.cloudinary.com/[cloud_name]/image/upload/w_400,h_300,c_fill/[image_id]
```

### Responsive Images
Cloudinary auto-generates multiple sizes for different devices.

### Image Optimization
Automatically compresses without quality loss:
- JPG → WebP for modern browsers
- Auto quality based on device

---

## 📞 Need Help?

- Cloudinary Docs: https://cloudinary.com/documentation
- Dashboard: https://cloudinary.com/console
- Support: support@cloudinary.com

---

**Status:** ✅ Ready to upload! Start adding images to professionals now.
