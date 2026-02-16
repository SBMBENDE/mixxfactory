/**
 * Animated Button Component with GSAP
 * 
 * Animation Strategy:
 * - Hover: Subtle lift + shadow increase (premium feel)
 * - Active: Slight scale down (tactile feedback)
 * - Respects reduced motion preferences
 * 
 * UX Benefits:
 * ✓ Provides clear hover feedback
 * ✓ Creates depth perception with shadow
 * ✓ Tactile click response builds trust
 * ✓ Performance optimized (transform only)
 */

'use client';

import { useRef, ReactNode } from 'react';
import { useGSAP } from '@/hooks/useGSAP';
import gsap from 'gsap';

interface AnimatedButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
}

export default function AnimatedButton({
  children,
  href,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  style = {},
  disabled = false,
}: AnimatedButtonProps) {
  const buttonRef = useRef<HTMLAnchorElement | HTMLButtonElement>(null);

  // Hover animations
  const { prefersReducedMotion } = useGSAP(() => {
    if (!buttonRef.current) return;

    const button = buttonRef.current;

    // Hover in: Lift + shadow
    const handleMouseEnter = () => {
      gsap.to(button, {
        y: -2,
        scale: 1.02,
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    // Hover out: Return to original
    const handleMouseLeave = () => {
      gsap.to(button, {
        y: 0,
        scale: 1,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    // Active: Scale down
    const handleMouseDown = () => {
      gsap.to(button, {
        scale: 0.97,
        duration: 0.1,
        ease: 'power2.in',
      });
    };

    // Release: Scale back
    const handleMouseUp = () => {
      gsap.to(button, {
        scale: 1.02,
        duration: 0.2,
        ease: 'power2.out',
      });
    };

    button.addEventListener('mouseenter', handleMouseEnter);
    button.addEventListener('mouseleave', handleMouseLeave);
    button.addEventListener('mousedown', handleMouseDown);
    button.addEventListener('mouseup', handleMouseUp);

    return () => {
      button.removeEventListener('mouseenter', handleMouseEnter);
      button.removeEventListener('mouseleave', handleMouseLeave);
      button.removeEventListener('mousedown', handleMouseDown);
      button.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Base styles
  const baseStyles: React.CSSProperties = {
    display: 'inline-block',
    textDecoration: 'none',
    fontWeight: '600',
    borderRadius: '0.5rem',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'colors 0.2s',
    border: 'none',
    textAlign: 'center',
    boxShadow: prefersReducedMotion
      ? '0 1px 3px rgba(0,0,0,0.1)'
      : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    opacity: disabled ? 0.6 : 1,
    ...style,
  };

  // Size variants
  const sizeStyles = {
    sm: { padding: '0.5rem 1rem', fontSize: '0.875rem' },
    md: { padding: '0.75rem 1.5rem', fontSize: '1rem' },
    lg: { padding: '1rem 2rem', fontSize: '1.125rem' },
  };

  // Color variants
  const variantStyles = {
    primary: {
      backgroundColor: 'rgb(249, 115, 22)',
      color: 'white',
    },
    secondary: {
      backgroundColor: 'rgb(59, 130, 246)',
      color: 'white',
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'rgb(249, 115, 22)',
      border: '2px solid rgb(249, 115, 22)',
    },
  };

  const combinedStyles = {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant],
  };

  if (href) {
    return (
      <a
        ref={buttonRef as React.RefObject<HTMLAnchorElement>}
        href={disabled ? undefined : href}
        className={className}
        style={combinedStyles}
        onClick={disabled ? (e) => e.preventDefault() : onClick}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      ref={buttonRef as React.RefObject<HTMLButtonElement>}
      className={className}
      style={combinedStyles}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      {children}
    </button>
  );
}
