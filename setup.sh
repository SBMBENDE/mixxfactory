#!/bin/bash

# Setup script for MixxFactory PWA

echo "🚀 Setting up MixxFactory PWA..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "📝 Creating .env.local from .env.example..."
  cp .env.example .env.local
  echo "⚠️  Please update .env.local with your MongoDB URI and JWT_SECRET"
  exit 1
fi

echo "✅ Environment variables configured"

# Run database setup (optional - for initial admin user)
echo "📦 Project is ready!"
echo ""
echo "📋 Next steps:"
echo "1. Update .env.local with your MongoDB connection string"
echo "2. Run: npm run dev"
echo "3. Visit: http://localhost:3000"
echo ""
echo "🔑 To create initial admin user, run:"
echo "   node scripts/seed-admin.js"
echo ""
echo "Happy coding! 🎉"
