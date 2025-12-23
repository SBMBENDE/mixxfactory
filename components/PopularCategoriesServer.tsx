/**
 * PopularCategories Server Component
 * Receives data from parent server component
 * Pure rendering - no hooks
 */

import Link from 'next/link';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface Props {
  categories: Category[];
}

const categoryEmojis: Record<string, string> = {
  dj: '🎧',
  'event-hall': '🏛️',
  stylist: '✨',
  restaurant: '🍽️',
  nightclub: '🌙',
  cameraman: '📹',
  promoter: '📢',
  decorator: '🎨',
  caterer: '🍽️',
  florist: '🌸',
  tech: '💻',
  'transport-service': '🚗',
  'cleaning-services': '🧹',
  childcare: '👶',
  'grocery-stores': '🛒',
  'handyman-services': '🔧',
};

export default function PopularCategoriesServer({ categories }: Props) {
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section style={{ padding: '3rem 1rem', backgroundColor: '#ffffff' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
            color: '#1f2937',
          }}>
            Popular Categories
          </h2>
          <p style={{
            color: '#6b7280',
            fontSize: '0.95rem',
          }}>
            Find professionals in your favorite category
          </p>
        </div>

        {/* Horizontal scroll categories */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          overflowX: 'auto',
          paddingBottom: '1rem',
          WebkitOverflowScrolling: 'touch',
        }}>
          {categories.map((category) => {
            const emoji = categoryEmojis[category.slug] || '⭐';
            return (
              <Link
                key={category._id}
                href={`/directory?category=${category.slug}`}
                style={{
                  flex: '0 0 auto',
                  minWidth: '140px',
                  padding: '1.5rem 1rem',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '0.75rem',
                  textDecoration: 'none',
                  color: '#1f2937',
                  textAlign: 'center',
                  border: '2px solid transparent',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.backgroundColor = '#dbeafe';
                  el.style.borderColor = '#2563eb';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.backgroundColor = '#f3f4f6';
                  el.style.borderColor = 'transparent';
                }}
              >
                <div style={{
                  fontSize: '2rem',
                  marginBottom: '0.5rem',
                }}>
                  {emoji}
                </div>
                <h3 style={{
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  margin: 0,
                  lineHeight: '1.3',
                }}>
                  {category.name}
                </h3>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
