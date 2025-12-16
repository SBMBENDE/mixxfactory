# 🎥 Social Media Video Integration Guide

Leverage Facebook, YouTube, and Vimeo to host heavy video files without consuming your own bandwidth. Videos are embedded directly from their sources.

## ✨ Supported Platforms

| Platform | Supported Formats | Example URL |
|----------|------------------|------------|
| **YouTube** | Videos, Shorts | `https://youtube.com/watch?v=dQw4w9WgXcQ` |
| **Facebook** | Videos, Reels | `https://www.facebook.com/watch/?v=...` |
| **Vimeo** | Videos, Live | `https://vimeo.com/123456789` |

## 🚀 Quick Start

### Add Video to Professional Profile

1. Go to **Dashboard → Professionals**
2. Click **Edit** on any professional
3. Scroll to **📹 Videos** section
4. Paste a YouTube/Facebook/Vimeo link
5. Click **+ Add Video**

### Add Video to Event

1. Go to **Dashboard → Events Management**
2. Click **Edit** on any event
3. Scroll to **📹 Videos** section
4. Paste a video link
5. Click **+ Add Video**

## 📝 Supported URL Formats

### YouTube
✓ `https://youtube.com/watch?v=VIDEO_ID`
✓ `https://youtu.be/VIDEO_ID`
✓ `https://www.youtube.com/embed/VIDEO_ID`

### Facebook
✓ `https://www.facebook.com/watch/?v=VIDEO_ID`
✓ `https://www.facebook.com/video/VIDEO_ID`
✓ `https://www.facebook.com/reel/VIDEO_ID`
✓ `https://fb.watch/VIDEO_ID`

### Vimeo
✓ `https://vimeo.com/VIDEO_ID`
✓ `https://player.vimeo.com/video/VIDEO_ID`

## 💾 Benefits

| Feature | Benefit |
|---------|---------|
| **No Storage** | Videos hosted on YouTube/Facebook/Vimeo servers |
| **No Bandwidth** | Doesn't count toward your Vercel or server limits |
| **Auto-Responsive** | Videos scale to any screen size |
| **Fast Loading** | Uses platform CDNs for lightning-fast delivery |
| **Easy Updates** | Add/remove videos without redeploying |
| **Professional** | Embed directly from official sources |

## 🎯 Use Cases

### Professional Portfolios
- DJ: Demo mixes, live performances
- Stylist: Hair transformation videos
- Restaurant: Chef cooking videos, ambiance clips
- Event Hall: Venue tours, past events

### Events
- Trailer videos for upcoming events
- Live performance clips from past events
- Sponsor showcases
- Event highlights reel

### Behind-the-Scenes
- Tutorial videos
- Work process documentations
- Customer testimonials
- Quick tips and hacks

## 🔄 API Integration

### Add Video to Professional

```bash
curl -X POST http://localhost:3000/api/admin/professionals/{id}/media \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_JWT_TOKEN" \
  -d '{
    "media": [
      "https://youtube.com/watch?v=dQw4w9WgXcQ",
      "https://www.facebook.com/watch/?v=123456789"
    ]
  }'
```

### Update Professional Media (Replace All)

```bash
curl -X PUT http://localhost:3000/api/admin/professionals/{id}/media \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_JWT_TOKEN" \
  -d '{
    "media": [
      "https://youtube.com/watch?v=newVideoId"
    ]
  }'
```

### Remove Video from Professional

```bash
curl -X DELETE http://localhost:3000/api/admin/professionals/{id}/media \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_JWT_TOKEN" \
  -d '{
    "url": "https://youtube.com/watch?v=dQw4w9WgXcQ"
  }'
```

### Same for Events

Replace `professionals` with `events` in the above URLs.

## 🎬 Component Usage

### Display Single Video

```tsx
import MediaEmbed from '@/components/MediaEmbed';

export default function MyComponent() {
  return (
    <MediaEmbed
      url="https://youtube.com/watch?v=dQw4w9WgXcQ"
      title="Amazing Performance"
      aspectRatio="video"
    />
  );
}
```

### Display Multiple Videos

```tsx
import MediaGallery from '@/components/MediaGallery';

export default function MyComponent() {
  const videos = [
    'https://youtube.com/watch?v=dQw4w9WgXcQ',
    'https://www.facebook.com/watch/?v=123456789'
  ];

  return (
    <MediaGallery
      media={videos}
      editable={false}
      isLoading={false}
    />
  );
}
```

### Admin Media Manager

```tsx
import ProfessionalMediaManager from '@/components/ProfessionalMediaManager';

export default function AdminPanel() {
  return (
    <ProfessionalMediaManager
      professionalId="507f1f77bcf86cd799439011"
      initialMedia={['https://youtube.com/watch?v=dQw4w9WgXcQ']}
      onMediaUpdated={(media) => console.log('Updated:', media)}
    />
  );
}
```

## 🔍 URL Extraction Utility

```tsx
import { extractMediaFromUrl, isValidMediaUrl } from '@/lib/utils/mediaExtractor';

// Extract media info from URL
const media = extractMediaFromUrl('https://youtube.com/watch?v=dQw4w9WgXcQ');
// Returns:
// {
//   type: 'youtube',
//   id: 'dQw4w9WgXcQ',
//   url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
//   embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
//   thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
// }

// Validate URL
const isValid = isValidMediaUrl('https://youtube.com/watch?v=dQw4w9WgXcQ');
// Returns: true

// Extract multiple URLs from text
import { extractMediaFromText } from '@/lib/utils/mediaExtractor';
const media = extractMediaFromText(`
  https://youtube.com/watch?v=dQw4w9WgXcQ
  https://www.facebook.com/watch/?v=123456789
`);
```

## 🛡️ Security Notes

✅ **Safe:** Videos are embedded from official sources
✅ **No Data Loss:** Videos hosted on platform servers
✅ **User Privacy:** No video data stored locally
✅ **HTTPS Only:** All embeds use secure HTTPS connections
✅ **Iframe Sandbox:** Videos run in restricted iframe context

## ⚠️ Limitations

- Videos must be **public** on their source platform
- Private/unlisted videos may not embed properly
- Some platforms may have embedding restrictions
- Mobile view may have limited controls depending on platform

## 🎓 Best Practices

1. **Use High Quality**: Upload videos in 1080p+ to source platforms
2. **Add Descriptions**: Include context about the video
3. **Monitor Embeds**: Periodically check videos are still accessible
4. **Backup URLs**: Keep original URLs in case you need to migrate
5. **Test Responsiveness**: Verify videos look good on mobile

## 📞 Support

**Platform Help:**
- YouTube Help: https://support.google.com/youtube
- Facebook Help: https://www.facebook.com/help
- Vimeo Help: https://vimeo.com/help

**MixxFactory:**
- Check existing videos: `/dashboard/professionals` or `/dashboard/events-management`
- Review API logs: Check browser console for errors
- Test URL: Use media extractor utility to validate URLs

## 🚀 Next Steps

1. ✅ Add videos to professional profiles
2. ✅ Create event highlight videos
3. ✅ Build video showcase page (future feature)
4. ✅ Add video recommendations algorithm (future)

---

**Status:** ✅ Ready to use
**Last Updated:** December 2025
