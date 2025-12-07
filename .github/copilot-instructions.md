/\*\*

- Copilot instructions for MixxFactory project
  \*/

# MixxFactory PWA Development Guide

## Project Overview

Progressive Web App (PWA) for discovering and managing professionals and venues including DJs, event halls, stylists, restaurants, and more.

## Tech Stack

- **Next.js 14+** (App Router) with TypeScript
- **React 18** for UI components
- **TailwindCSS** for styling with dark mode
- **MongoDB Atlas** with Mongoose ORM
- **JWT Authentication** with admin role support
- **Next-PWA** for service worker and offline support

## Architecture Principles

1. **Clean Code**: Clear file organization, meaningful names, comprehensive comments
2. **Type Safety**: Full TypeScript coverage with proper interfaces
3. **Security**: Input validation with Zod, secure password hashing, JWT tokens
4. **Performance**: Server components where possible, optimized images, efficient queries
5. **Scalability**: Modular components, reusable utilities, database indexing

## File Organization

### `/app` - Next.js App Router

- `(public)/` - Public pages (home, directory, professional details)
- `(dashboard)/` - Protected admin routes
- `/api` - API endpoints
- `layout.tsx` - Root layout
- `globals.css` - Global styles

### `/components` - Reusable Components

- `/ui` - Base UI components (Button, Card, Input, etc.)
- `/layout` - Layout components (Navbar, Footer, Sidebar)
- Follow compound component pattern where appropriate

### `/lib` - Business Logic & Utilities

- `/db` - MongoDB connection and models
- `/auth` - JWT and password utilities
- `/validations` - Zod schemas

### `/types` - TypeScript Definitions

- Central location for all type definitions
- Document complex types with JSDoc

### `/utils` - Helper Functions

- Pure functions for common operations
- API response formatting
- URL slug generation

### `/hooks` - Custom React Hooks

- Client-side state and effects
- Auth management, data fetching

## Database Design

### Models

1. **User** - Admin accounts with hashed passwords
2. **Category** - Service categories (DJ, Event Hall, etc.)
3. **Professional** - Individual professionals/venues with details
4. **Location** - Embedded location data for professionals

### Indexing Strategy

- `category: 1, active: 1, featured: -1` for efficient filtering
- Text indexes on `name` and `description` for search
- Unique indexes on `slug`, `email` fields

## API Structure

### Authentication

- `POST /api/auth/login` - Admin login with credentials
- JWT token stored in httpOnly cookies
- Middleware verifies admin role on protected routes

### Public Routes

- `GET /api/professionals` - Search/filter professionals
- `GET /api/categories` - Get all categories

### Admin Routes (Protected)

- `POST /api/admin/categories` - Create category
- `PUT /api/admin/categories/[id]` - Update category
- `DELETE /api/admin/categories/[id]` - Delete category
- `POST /api/admin/professionals` - Create professional
- `PUT /api/admin/professionals/[id]` - Update professional
- `DELETE /api/admin/professionals/[id]` - Delete professional

## Component Guidelines

### UI Components

- Accept `className` prop for Tailwind customization
- Use React.forwardRef for dom element components
- Include size and variant props for flexibility
- Provide default values for accessibility

### Layout Components

- Use client-side rendering only when necessary
- Handle responsive design with Tailwind breakpoints
- Include dark mode support with `dark:` prefix

## Common Patterns

### Form Handling

```typescript
const [formData, setFormData] = useState({...})
const handleChange = (e) => { setFormData(...) }
const handleSubmit = async (e) => {
  e.preventDefault()
  // Validate and submit
}
```

### Data Fetching (Client)

```typescript
useEffect(() => {
  const fetch = async () => {
    const res = await fetch('/api/...')
    const data = await res.json()
    // Handle response
  }
  fetch()
}, [dependencies])
```

### API Route Structure

```typescript
// Verify auth
// Validate input with Zod
// Connect to DB
// Execute operation
// Return formatted response
```

## PWA Features

### Service Worker (`/public/sw.js`)

- Network first for API routes
- Cache first for static assets
- Offline fallback support

### Manifest (`/public/manifest.json`)

- App metadata and icons
- Shortcuts for quick actions
- Display preferences

## Validation Strategy

### Input Validation

- Use Zod schemas for all inputs
- Validate in API routes before DB operations
- Return detailed error messages

### Common Schemas

- `loginSchema` - Email/password validation
- `createCategorySchema` - Category creation
- `createProfessionalSchema` - Professional creation
- `searchQuerySchema` - Query parameter validation

## Environment Variables

Required:

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT signing (min 32 chars)
- `NEXT_PUBLIC_APP_URL` - Application base URL

Optional:

- `CLOUDINARY_*` - Image upload credentials
- `ADMIN_EMAIL/PASSWORD` - Initial admin setup

## Testing Guidelines

### Unit Tests

- Test utility functions with Jest
- Mock external dependencies
- Test component rendering with React Testing Library

### API Tests

- Test route handlers with mock requests
- Verify validation logic
- Test authentication/authorization

## Performance Considerations

1. **Database Queries**

   - Use indexes on frequently filtered fields
   - Lean queries for read-only operations
   - Populate only needed fields

2. **Image Optimization**

   - Use Next.js Image component
   - Store URLs in DB (Cloudinary)
   - Set appropriate dimensions

3. **Caching**
   - Service worker handles static assets
   - HTTP caching headers on API routes
   - Database query result caching for analytics

## Security Checklist

- ✅ HTTPS in production
- ✅ JWT tokens in httpOnly cookies
- ✅ Password hashing with bcryptjs
- ✅ Input validation with Zod
- ✅ Admin role verification on protected routes
- ✅ Environment variables for secrets
- ✅ CORS headers configured
- ✅ SQL injection prevention (Mongoose handles)

## Development Workflow

1. **Feature Development**

   - Create feature branch: `git checkout -b feature/feature-name`
   - Update types and schemas first
   - Implement API route with validation
   - Create UI components
   - Add tests
   - Commit with descriptive message

2. **Code Review Checklist**
   - TypeScript types are complete
   - Error handling is present
   - Input validation is thorough
   - Database queries are optimized
   - No secrets in code
   - Follows project patterns

## Useful Commands

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm test                 # Run Jest tests
npm run test:watch      # Run tests in watch mode
```

## Troubleshooting

### MongoDB Connection Issues

- Verify MONGODB_URI in .env.local
- Check MongoDB Atlas network access
- Ensure connection string is correct

### Authentication Failing

- Verify JWT_SECRET length (min 32 chars)
- Check cookie settings in browser
- Verify token claims in JWT payload

### Service Worker Not Working

- Clear browser cache
- Check /public/sw.js syntax
- Verify manifest.json is valid

---

**Last Updated**: December 2025
**Status**: Active Development
