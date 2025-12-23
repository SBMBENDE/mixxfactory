# Authentication Architecture & Skeleton Loader Audit

## 1. useAuth Hook (AuthContext)
**File:** `/hooks/useAuth.ts`

```typescript
/**
 * Hook for managing authentication state
 * Implements 3-state auth system: loading -> authenticated/unauthenticated
 * Checks actual session validity via /api/auth/me endpoint
 */

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthUser {
  userId: string;
  email: string;
  role: string;
}

interface UseAuthReturn {
  authStatus: AuthStatus;           // ← 3-STATE: loading | authenticated | unauthenticated
  isAuthenticated: boolean;         // ← Backward compat: authStatus === 'authenticated'
  user: AuthUser | null;
  loading: boolean;                 // ← Backward compat: authStatus === 'loading'
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);

  // Check if user is authenticated
  const checkAuth = useCallback(async () => {
    setAuthStatus('loading');
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      
      if (res.ok) {
        const data = await res.json();
        if (data.data) {
          setUser(data.data);
          setAuthStatus('authenticated');
          return;
        }
      }
      
      setAuthStatus('unauthenticated');
      setUser(null);
    } catch (error) {
      setAuthStatus('unauthenticated');
      setUser(null);
    }
  }, []);

  // Logout - Clear state FIRST, then call API, then verify with fresh check
  const logout = useCallback(async () => {
    // Step 1: Immediately clear local state
    setAuthStatus('loading');
    setUser(null);
    
    // Step 2: Clear any stored auth data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_token');
    }
    
    // Step 3: Call logout API
    try {
      const response = await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include',
      });
      
      // Step 4: Wait for cookie deletion
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Step 5: Do a fresh auth check to verify token is really invalid
      const verifyResponse = await fetch('/api/auth/me', { credentials: 'include' });
      
      if (verifyResponse.status === 401) {
        setAuthStatus('unauthenticated');
      } else {
        // Token still valid (blacklist not working)
        setAuthStatus('unauthenticated');
      }
    } catch (error) {
      setAuthStatus('unauthenticated');
    }
  }, []);

  // Check auth on mount and when component focuses
  useEffect(() => {
    checkAuth();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAuth();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [checkAuth]);

  return {
    authStatus,
    isAuthenticated: authStatus === 'authenticated',
    user,
    loading: authStatus === 'loading',
    logout,
    refreshAuth: checkAuth,
  };
}
```

## 2. Logout Function Flow

```
logout() called
  ↓
setAuthStatus('loading')
setUser(null)
  ↓
Clear localStorage/sessionStorage
  ↓
POST /api/auth/logout
  - Extracts token from request
  - Calls blacklistToken(token) → adds to MongoDB
  - Deletes auth_token cookie
  - Returns 200
  ↓
Wait 200ms for cookie deletion
  ↓
GET /api/auth/me
  - Checks if token is blacklisted
  - If blacklisted (401) → Success
  - If not blacklisted (200) → Warning, but still set unauthenticated
  ↓
setAuthStatus('unauthenticated')
  ↓
Navbar component re-renders
  ↓
Page redirect to home (300ms delay)
```

## 3. Skeleton Loader Usage

### Navbar (CTA Section)
**File:** `/components/layout/Navbar.tsx` (line 113-145 & 213-235)

```tsx
{/* CTA Button - Desktop */}
<div className="hidden md:flex items-center gap-4">
  {!loading && (
    <>
      {isAuthenticated && user ? (
        <>
          {/* Show user email and logout button */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-100">
            <FontAwesomeIcon icon={faUser} />
            <span>{user.email}</span>
          </div>
          <button onClick={handleLogout}>
            {t.nav.logout}
          </button>
        </>
      ) : (
        <Link href="/auth/login">
          <Button>{t.nav.login}</Button>
        </Link>
      )}
    </>
  )}
</div>

{/* CTA Button - Mobile */}
{!loading && (
  <>
    {isAuthenticated && user ? (
      <> {/* Logout button */ </>
    ) : (
      <> {/* Login button */ </>
    )}
  </>
)}
```

**Problem:** No skeleton loader here - just hidden content when loading.

---

### FeaturedProfessionals Component
**File:** `/components/FeaturedProfessionals.tsx` (line 180-195)

```tsx
{loading ? (
  <>
    {[...Array(8)].map((_, i) => (
      <div key={i}>
        <SkeletonCard />
      </div>
    ))}
  </>
) : professionals.length > 0 ? (
  professionals.map((pro, index) => (
    <Link key={pro._id} href={`/professionals/${pro.slug}`}>
      {/* Professional card */}
    </Link>
  ))
) : (
  <p>No professionals found</p>
)}
```

**Flow:** `loading` state → Shows 8 skeleton cards → Data loaded → Shows real cards

---

### PopularCategories Component
**File:** `/components/PopularCategories.tsx` (line 163-185)

```tsx
{loading ? (
  <>
    {[...Array(7)].map((_, i) => (
      <div key={i} style={{ flex: '0 0 auto', width: isMobile ? '100px' : '140px' }}>
        <SkeletonCard />
      </div>
    ))}
  </>
) : (
  categories.map((category, index) => (
    <Link key={category._id} href={`/directory?category=${category.slug}`}>
      {/* Category card */}
    </Link>
  ))
)}
```

**Flow:** `loading` state → Shows 7 skeleton cards → Data loaded → Shows real cards

---

## Key Issues & Refactoring Opportunities

### Issue 1: No Auth-Based Skeleton Loading
Skeletons in `FeaturedProfessionals` and `PopularCategories` are **independent** from auth state.
They use local `loading` state for component-level data loading.

**Current:**
- Auth: `authStatus` (loading | authenticated | unauthenticated)
- Components: Local `loading` state per fetch

**Problem:** If auth is loading AND data is loading, you get skeletons. But if auth finishes loading before data, you get a flash of "Login" button then "Logout" button.

### Issue 2: Race Condition in Navbar
The `!loading` guard doesn't account for auth state changing:

```tsx
{!loading && (
  <>
    {isAuthenticated && user ? <LogoutUI /> : <LoginUI />}
  </>
)}
```

**What happens:**
1. Loading starts → hidden
2. Auth finishes (loading = false, isAuthenticated = true) → Shows logout
3. Logout called → Sets loading = true again → Hidden briefly
4. Auth finishes again → Shows login
5. **If auth check fails (token still valid)** → Shows logout again ← RACE CONDITION

### Issue 3: Skeleton Loader Timing
- `FeaturedProfessionals`: Uses its own fetch, independent of auth
- `PopularCategories`: Uses its own fetch, independent of auth
- **These can load before auth check completes**, causing visual inconsistency

---

## Refactoring Recommendations

### Option 1: Add Auth-Aware Skeleton (Minimal Change)
```tsx
// In FeaturedProfessionals
const { authStatus } = useAuth();

const showSkeleton = loading || authStatus === 'loading';

{showSkeleton ? <Skeleton /> : <Data />}
```

### Option 2: Defer Component Render Until Auth is Certain
```tsx
// In home page or layout
const { authStatus } = useAuth();

if (authStatus === 'loading') {
  return <PageSkeleton />; // Show full page skeleton
}

// Only then render content
return <HomePage />;
```

### Option 3: Use authStatus Directly in Navbar (Recommended)
```tsx
// Instead of: !loading
// Use: authStatus !== 'loading'

{authStatus !== 'loading' && (
  <>
    {authStatus === 'authenticated' && user ? <Logout /> : <Login />}
  </>
)}
```

---

## Summary Table

| Component | Location | Current Logic | Issue |
|-----------|----------|----------------|-------|
| **Navbar** | layout/Navbar.tsx | `!loading` | No skeleton, flash on logout |
| **FeaturedProfessionals** | components/ | Local `loading` | Loads before auth |
| **PopularCategories** | components/ | Local `loading` | Loads before auth |
| **useAuth** | hooks/useAuth.ts | 3-state system | Logout race condition |

