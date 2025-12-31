/**
 * PopularCategories Server Component
 * Receives data from parent server component
 * Pure rendering - no hooks
 */

import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as SolidIcons from '@fortawesome/free-solid-svg-icons';

interface Category {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
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
          <style>{`
            .category-link {
              flex: 0 0 auto;
              min-width: 140px;
              padding: 1.5rem 1rem;
              background-color: #f3f4f6;
              border-radius: 0.75rem;
              text-decoration: none;
              color: #1f2937;
              text-align: center;
              border: 2px solid transparent;
              transition: all 0.2s;
              display: inline-block;
            }
            .category-link:hover {
              background-color: #dbeafe;
              border-color: #2563eb;
            }
          `}</style>
          {categories.map((category) => {
            let iconNode: React.ReactNode = categoryEmojis[category.slug] || '⭐';
            if (category.icon) {
              if (category.icon.startsWith('fa-')) {
                const iconKey =
                  'fa' +
                  category.icon
                    .replace(/^fa-/, '-')
                    .split('-')
                    .map((part, i) => (i === 0 ? '' : part.charAt(0).toUpperCase() + part.slice(1)))
                    .join('');
                const faIcon = (SolidIcons as any)[iconKey] || (SolidIcons as any)['faPaintBrush'];
                iconNode = <FontAwesomeIcon icon={faIcon} style={{ fontSize: '2rem', marginBottom: '0.5rem' }} />;
              } else {
                iconNode = <span style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{category.icon}</span>;
              }
            }
            return (
              <Link
                key={category._id}
                href={`/directory?category=${category.slug}`}
                className="category-link"
              >
                <div style={{
                  fontSize: '2rem',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {iconNode}
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
