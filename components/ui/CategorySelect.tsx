import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as SolidIcons from '@fortawesome/free-solid-svg-icons';

interface Category {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
}

interface CategorySelectProps {
  categories: Category[];
  value: string;
  onChange: (slug: string) => void;
  placeholder?: string;
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

export const CategorySelect: React.FC<CategorySelectProps> = ({ categories, value, onChange, placeholder }) => {
  const [open, setOpen] = React.useState(false);
  const selectRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const getIconNode = (cat: Category) => {
    if (cat.icon) {
      if (cat.icon.startsWith('fa-')) {
        const iconKey =
          'fa' +
          cat.icon
            .replace(/^fa-/, '-')
            .split('-')
            .map((part, i) => (i === 0 ? '' : part.charAt(0).toUpperCase() + part.slice(1)))
            .join('');
        const faIcon = (SolidIcons as any)[iconKey] || (SolidIcons as any)['faPaintBrush'];
        return <FontAwesomeIcon icon={faIcon} className="mr-2" />;
      } else {
        return <span className="mr-2">{cat.icon}</span>;
      }
    }
    return <span className="mr-2">{categoryEmojis[cat.slug] || '⭐'}</span>;
  };

  const selected = categories.find(c => c.slug === value);

  return (
    <div className="relative w-full" ref={selectRef}>
      <button
        type="button"
        className="w-full border rounded px-3 py-2 flex items-center justify-between bg-white text-left"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex items-center">
          {selected ? getIconNode(selected) : null}
          {selected ? selected.name : (placeholder || 'Select category')}
        </span>
        <svg className="w-4 h-4 ml-2 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <ul className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-auto" role="listbox">
          {placeholder && (
            <li
              className="px-3 py-2 text-gray-400 cursor-pointer hover:bg-gray-100"
              onClick={() => { onChange(''); setOpen(false); }}
              role="option"
              aria-selected={value === ''}
            >
              {placeholder}
            </li>
          )}
          {categories.map(cat => (
            <li
              key={cat._id}
              className={`px-3 py-2 flex items-center cursor-pointer hover:bg-blue-100 ${value === cat.slug ? 'bg-blue-50 font-semibold' : ''}`}
              onClick={() => { onChange(cat.slug); setOpen(false); }}
              role="option"
              aria-selected={value === cat.slug}
            >
              {getIconNode(cat)}
              {cat.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
