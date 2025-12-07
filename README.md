# MixxFactory - Progressive Web App

A modern PWA for discovering and managing professionals and venues including DJs, event halls, stylists, restaurants, and more.

## 🚀 Tech Stack

- **Frontend**: Next.js 14+ (App Router), React 18, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB Atlas with Mongoose
- **Authentication**: JWT-based with admin role support
- **PWA**: Service workers, manifest.json, offline support
- **Language**: TypeScript
- **Testing**: Jest, React Testing Library
- **Styling**: TailwindCSS with dark mode support

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- MongoDB Atlas account (or local MongoDB)
- Environment variables configured

## 🔧 Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd mixxfactory
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. Configure your MongoDB connection:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mixxfactory?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
```

5. Run development server:
```bash
npm run dev
```

Visit `http://localhost:3000` to see the app.

## 📁 Project Structure

```
mixxfactory/
├── app/                          # Next.js app router
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   └── professionals/        # Professional management
│   ├── (dashboard)/              # Protected admin routes
│   ├── (public)/                 # Public routes
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── components/                   # Reusable React components
│   ├── ui/                       # UI components (Button, Card, Input)
│   └── layout/                   # Layout components (Navbar, Footer)
├── lib/                          # Utility libraries
│   ├── db/                       # Database connection and models
│   ├── auth/                     # Authentication utilities
│   └── validations/              # Zod validation schemas
├── types/                        # TypeScript type definitions
├── utils/                        # Helper utilities
├── hooks/                        # Custom React hooks
├── public/                       # Static assets and PWA files
│   ├── manifest.json             # PWA manifest
│   └── sw.js                     # Service worker
├── jest.config.js                # Jest testing configuration
├── next.config.js                # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
└── tsconfig.json                 # TypeScript configuration
```

## 🎯 Core Features

### 1. Public Directory
- Browse professionals by category
- Search functionality
- Filtering and sorting
- Responsive grid layout
- Professional detail pages

### 2. Admin Dashboard
- Secure login with JWT
- Category management (CRUD)
- Professional profile management
- Image uploads (Cloudinary ready)
- Analytics dashboard

### 3. PWA Support
- Installable on mobile/desktop
- Offline functionality
- Service worker caching
- App manifest
- Install prompt

### 4. Database Models

**User Model**
```typescript
{
  email: string (unique, indexed)
  password: string (hashed)
  role: 'admin' | 'user'
  timestamps
}
```

**Category Model**
```typescript
{
  name: string (unique)
  slug: string (unique, indexed)
  description: string
  icon: string (optional)
  timestamps
}
```

**Professional Model**
```typescript
{
  name: string
  slug: string (unique)
  category: ObjectId (ref: Category)
  description: string
  email, phone, website
  location: { city, region, country, coordinates }
  images: string[] (Cloudinary URLs)
  rating: number (0-5)
  reviewCount: number
  featured: boolean
  active: boolean
  timestamps
}
```

## 🔐 Authentication

The app uses JWT-based authentication:

1. Admin login with email/password
2. JWT token generated and stored in httpOnly cookies
3. Protected API routes verify token
4. Admin-only routes check role

### Login Endpoint
```
POST /api/auth/login
Body: { email: string, password: string }
Response: { success: true, data: { userId, email, role, token } }
```

## 📡 API Routes

### Public Routes
- `GET /api/professionals` - Get all professionals with filtering
- `GET /api/professionals/:slug` - Get professional details
- `GET /api/categories` - Get all categories

### Protected Routes (Admin)
- `POST /api/admin/categories` - Create category
- `PUT /api/admin/categories/:id` - Update category
- `DELETE /api/admin/categories/:id` - Delete category
- `POST /api/admin/professionals` - Create professional
- `PUT /api/admin/professionals/:id` - Update professional
- `DELETE /api/admin/professionals/:id` - Delete professional

## 🧪 Testing

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## 🚀 Build & Deploy

Build for production:
```bash
npm run build
npm start
```

## 🌙 Dark Mode

The app includes built-in dark mode support using Tailwind's `dark:` prefix. Users can toggle dark mode in the UI (to be implemented).

## 📦 Environment Variables

Required environment variables:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_min_32_chars
ADMIN_EMAIL=admin@mixxfactory.com
ADMIN_PASSWORD=initial_password
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NODE_ENV=development
```

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/feature-name`
2. Commit changes: `git commit -m 'Add feature'`
3. Push to branch: `git push origin feature/feature-name`
4. Open a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions, please open an issue on GitHub or contact support@mixxfactory.com

---

**Built with ❤️ by MixxFactory Team**
