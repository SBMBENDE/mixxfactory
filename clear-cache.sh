#!/bin/bash
# Clear all Next.js caches to force fresh data

echo "🧹 Clearing Next.js caches..."

# Remove build cache
rm -rf .next/cache
echo "✅ Cleared .next/cache"

# Remove static build
rm -rf .next/static
echo "✅ Cleared .next/static"

# Remove server build
rm -rf .next/server
echo "✅ Cleared .next/server"

echo ""
echo "✅ All caches cleared!"
echo ""
echo "📝 Next steps:"
echo "  1. Restart your dev server: npm run dev"
echo "  2. Hard refresh browser: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)"
echo "  3. Or open in incognito/private window"
echo ""
