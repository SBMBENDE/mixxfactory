# Architecture & Implementation Guide

## 🏗️ System Architecture

```
┌─────────────────────────────────────┐
│      Client (Browser/Mobile)        │
│  - React Components                 │
│  - Service Worker (offline support) │
│  - PWA Features                     │
└──────────────┬──────────────────────┘
               │ HTTPS / HTTP
               ↓
┌─────────────────────────────────────┐
│      Next.js 14 App Router          │
│  ├── Public Pages                   │
│  │   ├── /                          │
│  │   ├── /directory                 │
│  │   └── /professionals/[slug]      │
│  ├── Protected Routes               │
│  │   └── /dashboard/*               │
│  └── API Routes                     │
│      ├── /api/auth/*                │
│      ├── /api/professionals         │
│      ├── /api/categories            │
│      └── /api/admin/*               │
└──────────────┬──────────────────────┘
               │ Mongoose
               ↓
┌─────────────────────────────────────┐
│      MongoDB Atlas                  │
│  ├── Users Collection               │
│  ├── Categories Collection          │
│  └── Professionals Collection       │
└─────────────────────────────────────┘
```

## 🔐 Security Layers

### 1. **Input Validation**
- Zod schemas validate all API inputs
- Type-safe data flow with TypeScript

### 2. **Authentication**
- JWT tokens stored in httpOnly cookies
- Admin role verification on protected routes
- Password hashing with bcryptjs

### 3. **Database Security**
- Mongoose prevents SQL injection
- Unique indexes prevent duplicates
- Proper field validation

### 4. **API Security**
- CORS configured
- Rate limiting ready (to be implemented)
- Security headers in production

## 📊 Data Models

### User Model
```typescript
{
  _id: ObjectId
  email: string (unique, indexed)
  password: string (hashed)
  role: 'admin' | 'user'
  createdAt: Date
  updatedAt: Date
}
```

### Category Model
```typescript
{
  _id: ObjectId
  name: string (unique)
  slug: string (unique, indexed)
  description?: string
  icon?: string
  createdAt: Date
  updatedAt: Date
}
```

### Professional Model
```typescript
{
  _id: ObjectId
  name: string (indexed)
  slug: string (unique, indexed)
  category: ObjectId (ref: Category)
  description: string
  email?: string
  phone?: string
  website?: string
  location: {
    city?: string
    region?: string
    country?: string
    coordinates?: { lat, lng }
  }
  images: [string] // Cloudinary URLs
  rating: number (0-5)
  reviewCount: number
  featured: boolean (indexed)
  active: boolean (indexed)
  createdAt: Date
  updatedAt: Date
}
```

### Database Indexes
```
Category:
  - slug (unique)
  - name (unique)

Professional:
  - slug (unique)
  - category + active + featured
  - name + description (text search)

User:
  - email (unique)
```

## 🔄 API Endpoints

### Public Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/categories` | Get all categories |
| GET | `/api/professionals` | Get professionals with filtering |
| GET | `/api/professionals/:id` | Get single professional |
| POST | `/api/auth/login` | Admin login |

### Protected Endpoints (Admin Only)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/admin/categories` | Create category |
| PUT | `/api/admin/categories/:id` | Update category |
| DELETE | `/api/admin/categories/:id` | Delete category |
| POST | `/api/admin/professionals` | Create professional |
| PUT | `/api/admin/professionals/:id` | Update professional |
| DELETE | `/api/admin/professionals/:id` | Delete professional |
| POST | `/api/auth/logout` | Logout |

## 🎨 Component Architecture

### Base UI Components
- `Button` - Reusable button with variants
- `Card` - Container component
- `Input` - Form input field

### Layout Components
- `Navbar` - Top navigation
- `Dashboard Layout` - Admin layout with sidebar

### Page Components
- `HomePage` - Hero + categories preview
- `DirectoryPage` - Search & filter professionals
- `ProfessionalPage` - Detail view
- `LoginPage` - Admin authentication
- `DashboardPage` - Admin dashboard

## 🔍 Search & Filtering

### Search Strategy
```
1. Text search on name + description
2. Filter by category
3. Sort by: newest, rating, name
4. Pagination: 12 items per page
```

### Database Query Optimization
```
- Use lean() for read-only queries
- Indexes on frequently filtered fields
- Populate only needed relations
- Pagination to limit result sets
```

## 🚀 Performance Optimizations

### Image Optimization
- Next.js Image component with optimization
- Cloudinary for image hosting
- Lazy loading on directory page

### Caching Strategy
- Service Worker: Cache-first for assets
- Service Worker: Network-first for API
- Browser cache: CSS, JS, fonts

### Database Optimization
- Compound indexes for multi-field queries
- Text indexes for search
- Connection pooling via Mongoose

## 🧪 Testing Strategy

### Unit Tests
- Component rendering with React Testing Library
- Utility functions with Jest
- API response formatting

### Integration Tests
- API route handlers with mock requests
- Database operations with test DB
- Authentication flow

### E2E Tests (Future)
- Playwright for full user workflows
- Admin CRUD operations
- Directory browsing experience

## 🔐 Best Practices Implemented

✅ TypeScript for type safety
✅ Zod for input validation
✅ JWT for authentication
✅ Password hashing with bcryptjs
✅ httpOnly cookies for tokens
✅ Mongoose for DB abstraction
✅ Environment variables for secrets
✅ Clean code organization
✅ Error handling patterns
✅ API response standardization

## 📈 Scalability Considerations

### Current Architecture Supports
- 100K+ professionals
- 1000+ categories
- Thousands of concurrent users

### To Scale Further
1. Add Redis for caching
2. Implement API rate limiting
3. Add database replication
4. Use CDN for static assets
5. Implement search with Elasticsearch
6. Add background jobs with Bull

## 🔄 Development Workflow

1. **Types First**
   - Define data types in `/types`
   - Create Zod validation schemas

2. **Backend**
   - Create API routes
   - Add business logic to `/lib`

3. **Frontend**
   - Build UI components
   - Create pages that consume APIs

4. **Testing**
   - Add unit tests
   - Test API integration

5. **Optimization**
   - Check Lighthouse score
   - Profile performance
   - Optimize database queries

## 🚀 Deployment Pipeline

1. **Local Development**
   - Run `npm run dev`
   - Test locally

2. **Build**
   - Run `npm run build`
   - Check for errors

3. **Testing**
   - Run `npm test`
   - Manual QA

4. **Staging**
   - Deploy to staging environment
   - Full testing

5. **Production**
   - Deploy to production
   - Monitor performance

---

See `DEPLOYMENT.md` for production deployment details.
