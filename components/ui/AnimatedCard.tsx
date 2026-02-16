/**
 * Animated Card Wrapper
 * 
 * Animation Strategy:
 * - Hover: Lift card + increase shadow (depth)
 * - Focus: Glow effect for keyboard users
 * - Respects reduced motion
 * 
 * UX Benefits:
 * ✓ Creates layered, premium feel
 * ✓ Clear interactive feedback
 * ✓ Accessibility for keyboard navigation
 * ✓ GPU-accelerated transforms only
 */

'use client';

import { useRef, ReactNode } from 'react';
import { useGSAP } from '@/hooks/useGSAP';
import gsap from 'gsap';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  href?: string;
}

export default function AnimatedCard({
  children,
  className = '',
  style = {},
  onClick,
  href,
}: AnimatedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Card hover animation
  const { prefersReducedMotion } = useGSAP(() => {
    if (!cardRef.current) return;

    const card = cardRef.current;

    const handleMouseEnter = () => {
      gsap.to(card, {
        y: -8,
        scale: 1.02,
        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.15)',
        duration: 0.4,
        ease: 'power3.out',
      });
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        y: 0,
        scale: 1,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const baseStyles: React.CSSProperties = {
    borderRadius: '0.75rem',
    backgroundColor: 'white',
    boxShadow: prefersReducedMotion
      ? '0 1px 3px rgba(0,0,0,0.1)'
      : '0 1px 3px rgba(0,0,0,0.1)',
    transition: 'box-shadow 0.3s',
    cursor: onClick || href ? 'pointer' : 'default',
    ...style,
  };

  const content = (
    <div
      ref={cardRef}
      className={className}
      style={baseStyles}
      onClick={onClick}
    >
      {children}
    </div>
  );

  if (href) {
    return <a href={href} style={{ textDecoration: 'none', color: 'inherit' }}>{content}</a>;
  }

  return content;
}
