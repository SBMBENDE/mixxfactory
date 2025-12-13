# Mobile App Optimization Guide

## 📱 PWA Features Enabled

### 1. **Install Prompt**
- Native app install prompts on supported browsers (Chrome, Edge, Firefox)
- Custom in-app install banner with "Install App" button
- Persistent across sessions until dismissed
- File: `components/PWAInstallPrompt.tsx`

**How it works:**
- Automatically shows on first visit on mobile
- Users can dismiss for the session
- Appears again on next visit if not installed
- Once installed, app runs in standalone mode

### 2. **Advanced Service Worker Caching**

The service worker now uses intelligent caching strategies:

#### Network First (APIs)
- Tries network first, falls back to cache
- Timeout: 5 seconds
- Cache expiry: 5 minutes
- Perfect for: API calls, dynamic content

#### Cache First (Assets)
- Uses cached version immediately
- Falls back to network if not cached
- Cache expiry: 30-60 days depending on asset type
- Perfect for: Images, fonts, static assets

#### Caching Strategy by Resource Type:

| Resource | Strategy | Cache Time | Max Items |
|----------|----------|-----------|-----------|
| API routes | NetworkFirst | 5 min | 50 |
| Google Fonts | CacheFirst | 1 year | 20 |
| Images | CacheFirst | 60 days | 100 |
| Cloudinary images | CacheFirst | 60 days | 150 |
| Social media images | CacheFirst | 7 days | 80 |
| JS/CSS assets | CacheFirst | 30 days | 60 |

### 3. **Mobile Meta Tags**

Enhanced metadata for better mobile experience:

- **Viewport**: Device-width, proper scaling
- **Status bar**: Black translucent (iOS)
- **Format detection**: Phone numbers, emails, addresses are clickable
- **Icons**: Apple touch icon support
- **App name**: Displays correctly on home screen

### 4. **Touch Gestures Support**

New hooks available in `hooks/useTouch.ts`:

#### `useTouchGestures`
Detect swipes and long presses on mobile:

```typescript
const { onTouchStart, onTouchEnd } = useTouchGestures(
  () => console.log('Swiped left'),     // onSwipeLeft
  () => console.log('Swiped right'),    // onSwipeRight
  () => console.log('Long pressed')      // onLongPress
);

return (
  <div 
    onTouchStart={onTouchStart}
    onTouchEnd={onTouchEnd}
  >
    Swipe or long press me
  </div>
);
```

#### `usePreventBodyScroll`
Prevent body scroll in modals/drawers:

```typescript
export function MyModal() {
  usePreventBodyScroll();
  
  return <div>Modal content (body won't scroll)</div>;
}
```

#### `useStandaloneMode`
Detect if app is running as installed PWA:

```typescript
export function MyComponent() {
  const isStandalone = useStandaloneMode();
  
  return isStandalone ? <AppUI /> : <WebUI />;
}
```

### 5. **Image Optimization for Mobile**

- **Responsive images**: Images scale properly on all screen sizes
- **WebP support**: Modern browsers get smaller files
- **Lazy loading**: Images load only when visible
- **CDN delivery**: Cloudinary serves images from nearest server
- **Social media**: Facebook, Instagram images cached for 7 days

### 6. **Performance Optimizations**

#### Bundle Size
- Server components reduce client-side JavaScript
- Code splitting for routes
- Tree shaking removes unused code

#### Network
- API calls cached for 5 minutes
- Images cached for 30-60 days
- Fonts cached for 1 year
- 5-second timeout prevents hanging

#### Rendering
- Images optimized by Next.js Image component
- Lazy image loading
- Dark mode support (reduced battery drain)

## 🚀 How to Use

### For End Users

**Installing the App:**
1. Open MixxFactory on mobile browser
2. Look for "Install App" banner at bottom (or browser prompt)
3. Tap "Install App" or browser's install button
4. App appears on home screen
5. Opens fullscreen like native app

**Benefits:**
- ✅ Works offline for cached content
- ✅ Faster loading (uses service worker cache)
- ✅ No browser chrome/address bar
- ✅ Push notifications ready
- ✅ Takes up home screen space (bookmarked access)
- ✅ Works like native app

### For Developers

**Adding Swipe Support:**
```typescript
import { useTouchGestures } from '@/hooks/useTouch';

export function ImageGallery({ images }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const { onTouchStart, onTouchEnd } = useTouchGestures(
    () => setCurrentIndex(i => (i + 1) % images.length), // next
    () => setCurrentIndex(i => (i - 1 + images.length) % images.length) // prev
  );

  return (
    <img 
      src={images[currentIndex]}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    />
  );
}
```

**Using Touch Gestures in Components:**
```typescript
const { onTouchStart, onTouchEnd } = useTouchGestures(
  onSwipeLeft,   // optional
  onSwipeRight,  // optional
  onLongPress    // optional
);
```

## 📊 Browser Support

| Browser | iOS | Android | PWA Install |
|---------|-----|---------|------------|
| Chrome | ✅ | ✅ | ✅ Yes |
| Safari | ✅ | N/A | ⚠️ Limited* |
| Edge | ✅ | ✅ | ✅ Yes |
| Firefox | ✅ | ✅ | ✅ Yes |
| Samsung | N/A | ✅ | ✅ Yes |

*iOS 16.4+ supports PWA installation with limited features

## 🔧 Configuration

### Update Service Worker Caching

Edit `next.config.js` in the `runtimeCaching` array:

```javascript
{
  urlPattern: /^https:\/\/your-domain\.com\/.*/i,
  handler: 'CacheFirst', // or 'NetworkFirst'
  options: {
    cacheName: 'your-cache-name',
    expiration: {
      maxEntries: 100,
      maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
    },
  },
}
```

### Add More Image Hostnames

Edit `next.config.js` in the `images.remotePatterns`:

```javascript
{
  protocol: 'https',
  hostname: 'your-cdn.com',
}
```

## 📈 Monitoring

Check PWA functionality:

1. **DevTools**:
   - Open DevTools → Application → Manifest
   - Check service worker is registered
   - View cache storage

2. **Lighthouse**:
   - Open DevTools → Lighthouse
   - Run PWA audit
   - Check scores

3. **Install Status**:
   - DevTools → Application → Manifest
   - Look for "App is installable"

## 🚨 Troubleshooting

**App won't install?**
- Ensure manifest.json is valid
- Check service worker is registered
- App must be served over HTTPS (in production)
- Browser requires HTTPS for PWA

**Images not caching?**
- Check hostname is in `images.remotePatterns`
- Verify cache expiration isn't too short
- Check DevTools → Application → Cache Storage

**Service worker not updating?**
- Clear cache in DevTools
- Reload with Ctrl+Shift+R (hard refresh)
- Check `skipWaiting: true` in config

**Touch gestures not working?**
- Ensure you're using `useTouchGestures` hook
- Check swipe distance is > 50px
- Check swipe time is < 300ms

## 📚 Resources

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Next.js PWA Plugin](https://github.com/shadowwalker/next-pwa)
- [Web App Manifest](https://www.w3.org/TR/appmanifest/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Lighthouse PWA Audit](https://developers.google.com/web/tools/lighthouse)

---

**Last Updated**: December 2025
**Status**: Production Ready
