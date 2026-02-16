/**
 * GSAP Animation Hook
 * 
 * Purpose: Centralized GSAP initialization with accessibility support
 * - Respects prefers-reduced-motion for accessible animations
 * - Provides cleanup on unmount
 * - Optimizes performance by checking motion preference
 */

'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * Check if user prefers reduced motion
 * @returns boolean indicating if animations should be disabled
 */
export function useReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  return mediaQuery.matches;
}

/**
 * Custom hook for GSAP animations with accessibility support
 * 
 * @param callback - GSAP animation function
 * @param deps - Dependency array (like useEffect)
 * @returns Object with gsap context and prefersReducedMotion flag
 */
export function useGSAP(
  callback: (context: gsap.Context) => void | (() => void),
  deps: React.DependencyList = []
) {
  const contextRef = useRef<gsap.Context>();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    // Skip animations if user prefers reduced motion
    if (prefersReducedMotion) {
      return;
    }

    // Create GSAP context for scoped animations
    contextRef.current = gsap.context(() => {
      callback(contextRef.current!);
    });

    // Cleanup on unmount
    return () => {
      contextRef.current?.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return {
    context: contextRef.current,
    prefersReducedMotion,
  };
}

/**
 * Default animation configurations for consistency
 */
export const ANIMATION_DEFAULTS = {
  // Duration presets
  duration: {
    fast: 0.3,
    normal: 0.6,
    slow: 1.2,
  },
  
  // Easing presets (professional motion curves)
  ease: {
    smooth: 'power2.out',
    snappy: 'power3.out',
    elastic: 'back.out(1.2)',
    entrance: 'power4.out',
  },
  
  // Stagger presets
  stagger: {
    fast: 0.1,
    normal: 0.15,
    slow: 0.2,
  },
};
