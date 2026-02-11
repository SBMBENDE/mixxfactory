/**
 * TableOfContents Component - Auto-generated from blog post headings
 */

'use client';

import { useEffect, useState } from 'react';
import { List } from 'lucide-react';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Parse headings from content (markdown or HTML)
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    const headingElements = tempDiv.querySelectorAll('h1, h2, h3, h4');
    const items: TOCItem[] = Array.from(headingElements).map((heading, index) => {
      const id = heading.id || `heading-${index}`;
      return {
        id,
        text: heading.textContent || '',
        level: parseInt(heading.tagName.charAt(1)),
      };
    });
    
    setHeadings(items);

    // Intersection Observer for active heading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -66%' }
    );

    // Observe all headings in the actual document
    headingElements.forEach((heading) => {
      const actualHeading = document.getElementById(heading.id || '');
      if (actualHeading) observer.observe(actualHeading);
    });

    return () => observer.disconnect();
  }, [content]);

  if (headings.length === 0) return null;

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="sticky top-24 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <List className="h-5 w-5 text-orange-600" />
        <h3 className="font-bold text-gray-900 dark:text-white">Table of Contents</h3>
      </div>
      
      <nav className="space-y-2">
        {headings.map((heading) => (
          <button
            key={heading.id}
            onClick={() => scrollToHeading(heading.id)}
            className={`
              block w-full text-left text-sm transition-colors
              ${heading.level === 2 ? 'pl-0' : heading.level === 3 ? 'pl-4' : 'pl-8'}
              ${activeId === heading.id
                ? 'text-orange-600 dark:text-orange-400 font-semibold'
                : 'text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400'
              }
            `}
          >
            {heading.text}
          </button>
        ))}
      </nav>
    </div>
  );
}
