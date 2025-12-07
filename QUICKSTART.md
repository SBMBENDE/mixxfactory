# Quick Start Guide - MixxFactory PWA

## 🚀 Get Started in 5 Minutes

### 1. Setup Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mixxfactory
JWT_SECRET=your_super_secret_key_minimum_32_characters_long
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_password
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Initial Admin User (Optional)

```bash
node scripts/seed-admin.js
```

### 4. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000 to see the app.

## 📍 Key URLs

- **Home**: http://localhost:3000
- **Directory**: http://localhost:3000/directory
- **Admin Login**: http://localhost:3000/auth/login
- **Admin Dashboard**: http://localhost:3000/dashboard

## 🔧 Useful Commands

```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run ESLint
npm test                 # Run tests
npm run test:watch      # Run tests in watch mode
```

## 🗄️ Database Setup

### MongoDB Atlas

1. Create account at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create a new cluster
3. Add IP to network access whitelist
4. Create database user
5. Copy connection string to `.env.local`

### Test Data

After running seed script, login with:
- **Email**: `admin@mixxfactory.com` (or your custom email)
- **Password**: Your set password

## 📱 PWA Installation

The app is installable on mobile and desktop:

1. **Mobile**: Click menu → "Install app"
2. **Desktop**: Click install icon in address bar or Settings → "Install MixxFactory"

## 🔑 Default Admin Credentials

After running `node scripts/seed-admin.js`:

- **Email**: `admin@mixxfactory.com`
- **Password**: Set during seed (default in script)

**Remember to change these in production!**

## 🛠️ Development Workflow

1. **Create feature branch**: `git checkout -b feature/my-feature`
2. **Make changes**: Edit files, components, APIs
3. **Run tests**: `npm test`
4. **Lint code**: `npm run lint`
5. **Commit**: `git commit -m "Add feature"`
6. **Push**: `git push origin feature/my-feature`
7. **Create PR**: Open pull request on GitHub

## 📚 Project Structure

```
mixxfactory/
├── app/                    # Next.js app router
├── components/             # React components
├── lib/                    # Business logic
├── types/                  # TypeScript types
├── hooks/                  # Custom hooks
├── utils/                  # Utilities
├── public/                 # Static files
└── scripts/                # Utility scripts
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### MongoDB Connection Failed

- Verify `.env.local` has correct URI
- Check MongoDB Atlas IP whitelist
- Test connection with MongoDB Compass

### Build Errors

```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

## 📖 Next Steps

1. Review `/README.md` for full documentation
2. Check `/DEPLOYMENT.md` for production setup
3. Explore `/app` to understand project structure
4. Create categories and professionals in admin panel

## 🆘 Need Help?

- Check `/README.md` documentation
- Review `.github/copilot-instructions.md` for architecture patterns
- Check Next.js docs: https://nextjs.org
- Check MongoDB docs: https://docs.mongodb.com

## ✅ Checklist for First Run

- [ ] `.env.local` configured
- [ ] Dependencies installed (`npm install`)
- [ ] Dev server running (`npm run dev`)
- [ ] Can access http://localhost:3000
- [ ] Can see home page and directory
- [ ] Admin seed created (`node scripts/seed-admin.js`)
- [ ] Can login at `/auth/login`
- [ ] Can access `/dashboard`

---

**Happy coding! 🎉**
