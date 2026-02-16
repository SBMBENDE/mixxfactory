/**
 * PopularCategories Client Component
 * Receives data from parent server component
 * Uses translation hook
 * 
 * Animation Strategy:
 * - Infinite horizontal loop on mobile/tablet (seamless)
 * - Auto-scrolls at slow, luxury speed
 * - Draggable/swipeable with momentum
 * - Pauses on hover (desktop)
 * - Respects prefers-reduced-motion
 * - Uses transform: translateX for GPU acceleration
 */

'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as SolidIcons from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from '@/hooks/useTranslations';
import { useLanguage } from '@/hooks/useLanguage';
import { useReducedMotion } from '@/hooks/useGSAP';

// Configuration constants for easy adjustment
const ANIMATION_CONFIG = {
  // Speed in pixels per second (lower = slower, more luxury feel)
  speed: 30,
  // Number of times to duplicate cards for seamless loop
  duplications: 3,
  // Breakpoint below which animation runs (px)
  mobileBreakpoint: 1024,
  // Momentum decay factor (0-1, lower = more friction)
  momentumDecay: 0.95,
  // Minimum velocity to continue momentum
  minVelocity: 0.1,
};

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
  const t = useTranslations();
  const { language } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  
  // Animation state
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const animationFrameRef = useRef<number | null>(null);
  const translateXRef = useRef(0);
  const trackWidthRef = useRef(0);
  
  // Drag state
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const velocityRef = useRef(0);
  const lastMoveTimeRef = useRef(0);
  const lastMoveXRef = useRef(0);

  // Check if we're on mobile/tablet
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < ANIMATION_CONFIG.mobileBreakpoint);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate track width for seamless loop
  useEffect(() => {
    if (!trackRef.current || !isMobile) return;
    
    const calculateWidth = () => {
      const track = trackRef.current;
      if (!track) return;
      
      // Get width of one full set of cards (original, not duplicates)
      const cards = Array.from(track.children);
      const originalCardCount = Math.floor(cards.length / ANIMATION_CONFIG.duplications);
      let oneSetWidth = 0;
      
      for (let i = 0; i < originalCardCount; i++) {
        const card = cards[i] as HTMLElement;
        oneSetWidth += card.offsetWidth + 16; // 16px gap
      }
      
      trackWidthRef.current = oneSetWidth;
    };
    
    calculateWidth();
    window.addEventListener('resize', calculateWidth);
    
    return () => window.removeEventListener('resize', calculateWidth);
  }, [categories, isMobile]);

  // Infinite loop animation
  useEffect(() => {
    // Only run on mobile/tablet, when not in reduced motion mode
    if (!isMobile || prefersReducedMotion || !trackRef.current) return;
    
    const track = trackRef.current;
    let lastTime = performance.now();
    
    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
      lastTime = currentTime;
      
      // Handle momentum after drag
      if (!isDraggingRef.current && Math.abs(velocityRef.current) > ANIMATION_CONFIG.minVelocity) {
        translateXRef.current += velocityRef.current * deltaTime * 60; // 60fps normalization
        velocityRef.current *= ANIMATION_CONFIG.momentumDecay;
      }
      // Auto-scroll when not hovered and not dragging
      else if (!isHovered && !isDraggingRef.current) {
        translateXRef.current -= ANIMATION_CONFIG.speed * deltaTime;
        velocityRef.current = -ANIMATION_CONFIG.speed / 60; // Store direction for resume
      }
      
      // Seamless loop: reset position when one full set has scrolled
      const oneSetWidth = trackWidthRef.current;
      if (oneSetWidth > 0) {
        // Loop forward
        if (translateXRef.current <= -oneSetWidth) {
          translateXRef.current += oneSetWidth;
        }
        // Loop backward (when dragging right)
        if (translateXRef.current > 0) {
          translateXRef.current -= oneSetWidth;
        }
      }
      
      // Apply transform
      track.style.transform = `translateX(${translateXRef.current}px)`;
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isMobile, isHovered, prefersReducedMotion]);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isMobile) return;
    
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    currentXRef.current = e.clientX;
    lastMoveXRef.current = e.clientX;
    lastMoveTimeRef.current = performance.now();
    velocityRef.current = 0;
    
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grabbing';
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    
    const currentTime = performance.now();
    const deltaTime = currentTime - lastMoveTimeRef.current;
    const deltaX = e.clientX - lastMoveXRef.current;
    
    // Calculate velocity for momentum
    if (deltaTime > 0) {
      velocityRef.current = (deltaX / deltaTime) * 16.67; // Convert to ~60fps
    }
    
    // Update position
    const diff = e.clientX - currentXRef.current;
    translateXRef.current += diff;
    currentXRef.current = e.clientX;
    lastMoveXRef.current = e.clientX;
    lastMoveTimeRef.current = currentTime;
  };

  const handleMouseUp = () => {
    if (!isDraggingRef.current) return;
    
    isDraggingRef.current = false;
    
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab';
    }
  };

  // Touch drag handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    
    const touch = e.touches[0];
    isDraggingRef.current = true;
    startXRef.current = touch.clientX;
    currentXRef.current = touch.clientX;
    lastMoveXRef.current = touch.clientX;
    lastMoveTimeRef.current = performance.now();
    velocityRef.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    
    const touch = e.touches[0];
    const currentTime = performance.now();
    const deltaTime = currentTime - lastMoveTimeRef.current;
    const deltaX = touch.clientX - lastMoveXRef.current;
    
    // Calculate velocity for momentum
    if (deltaTime > 0) {
      velocityRef.current = (deltaX / deltaTime) * 16.67;
    }
    
    // Update position
    const diff = touch.clientX - currentXRef.current;
    translateXRef.current += diff;
    currentXRef.current = touch.clientX;
    lastMoveXRef.current = touch.clientX;
    lastMoveTimeRef.current = currentTime;
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  if (!categories || categories.length === 0) {
    return null;
  }

  const getCategoryLabel = (cat: Category) => {
    const categories = t.categories as any;
    if (language === 'fr' && categories && cat.slug && Object.prototype.hasOwnProperty.call(categories, cat.slug)) {
      return categories[cat.slug];
    }
    return cat.name;
  };

  // Render category card (extracted for reuse in duplicates)
  const renderCategoryCard = (category: Category, index: number, keyPrefix: string = '') => {
    let iconNode: React.ReactNode = categoryEmojis[category.slug] || '\u2b50';
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
        key={`${keyPrefix}${category._id}-${index}`}
        href={`/directory?category=${category.slug}`}
        className="category-link"
        // Prevent default drag behavior on links
        draggable={false}
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
          {getCategoryLabel(category)}
        </h3>
      </Link>
    );
  };

  // Generate cards array with duplicates for seamless loop
  const cardsToRender = isMobile && !prefersReducedMotion
    ? Array.from({ length: ANIMATION_CONFIG.duplications }, (_, dupIndex) =>
        categories.map((cat, catIndex) => renderCategoryCard(cat, catIndex, `dup-${dupIndex}-`))
      ).flat()
    : categories.map((cat, index) => renderCategoryCard(cat, index));

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
            {t.home.popularCategories}
          </h2>
        </div>

        {/* Horizontal scroll/loop categories */}
        <div
          ref={containerRef}
          style={{
            position: 'relative',
            overflow: 'hidden',
            // Cursor changes for desktop drag
            cursor: isMobile && !prefersReducedMotion ? 'grab' : 'default',
            userSelect: 'none',
            WebkitUserSelect: 'none',
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            handleMouseUp();
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            ref={trackRef}
            style={{
              display: 'flex',
              gap: '1rem',
              // For desktop or reduced motion: enable scrolling
              overflowX: (!isMobile || prefersReducedMotion) ? 'auto' : 'visible',
              paddingBottom: '1rem',
              WebkitOverflowScrolling: 'touch',
              // Disable pointer events during drag to prevent link clicks
              pointerEvents: isDraggingRef.current ? 'none' : 'auto',
            }}
          >
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
                /* Prevent text selection during drag */
                user-select: none;
                -webkit-user-select: none;
                /* Prevent image ghosting on drag */
                -webkit-user-drag: none;
              }
              .category-link:hover {
                background-color: #dbeafe;
                border-color: #2563eb;
              }
              /* Hide scrollbar on mobile when animating */
              @media (max-width: ${ANIMATION_CONFIG.mobileBreakpoint}px) {
                div[ref] {
                  scrollbar-width: none;
                  -ms-overflow-style: none;
                }
                div[ref]::-webkit-scrollbar {
                  display: none;
                }
              }
            `}</style>
            {cardsToRender}
          </div>
        </div>
      </div>
    </section>
  );
}
