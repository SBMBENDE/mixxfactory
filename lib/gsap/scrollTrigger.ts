/**
 * GSAP ScrollTrigger Configuration
 * 
 * Purpose: Initialize ScrollTrigger with optimal settings for performance
 * - Lazy loads ScrollTrigger plugin
 * - Configures sensible defaults
 * - Provides reusable scroll animation presets
 */

'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Scroll reveal animation presets
 * These animations reveal content as user scrolls
 */
export const scrollRevealPresets = {
  /**
   * Fade up animation - element fades in while moving up
   * Use case: Cards, content blocks, images
   */
  fadeUp: {
    from: {
      opacity: 0,
      y: 60,
    },
    to: {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
    },
  },

  /**
   * Fade in animation - simple opacity change
   * Use case: Text, subtle elements
   */
  fadeIn: {
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
      duration: 0.6,
      ease: 'power2.out',
    },
  },

  /**
   * Scale up animation - element grows into view
   * Use case: Icons, badges, featured items
   */
  scaleUp: {
    from: {
      opacity: 0,
      scale: 0.8,
    },
    to: {
      opacity: 1,
      scale: 1,
      duration: 0.7,
      ease: 'back.out(1.2)',
    },
  },

  /**
   * Slide in from left
   * Use case: Alternate row animations, content sections
   */
  slideLeft: {
    from: {
      opacity: 0,
      x: -60,
    },
    to: {
      opacity: 1,
      x: 0,
      duration: 0.8,
      ease: 'power3.out',
    },
  },

  /**
   * Slide in from right
   * Use case: Alternate row animations, content sections
   */
  slideRight: {
    from: {
      opacity: 0,
      x: 60,
    },
    to: {
      opacity: 1,
      x: 0,
      duration: 0.8,
      ease: 'power3.out',
    },
  },
};

/**
 * Create a scroll-triggered animation
 * 
 * @param trigger - Element that triggers the animation
 * @param animation - GSAP animation timeline or tween
 * @param options - ScrollTrigger options
 * @returns ScrollTrigger instance
 */
export function createScrollAnimation(
  trigger: string | Element,
  animation: gsap.core.Animation,
  options?: ScrollTrigger.Vars
) {
  return ScrollTrigger.create({
    trigger,
    start: 'top 80%', // Animation starts when element is 80% down viewport
    end: 'bottom 20%',
    toggleActions: 'play none none none', // Play once on enter
    ...options,
    animation,
  });
}

/**
 * Batch scroll reveal animation
 * Animates multiple elements with stagger
 * 
 * @param selector - CSS selector for elements to animate
 * @param preset - Animation preset from scrollRevealPresets
 * @param stagger - Stagger delay between elements
 */
export function batchScrollReveal(
  selector: string,
  preset: keyof typeof scrollRevealPresets = 'fadeUp',
  stagger: number = 0.15
) {
  const { from, to } = scrollRevealPresets[preset];
  
  ScrollTrigger.batch(selector, {
    onEnter: (batch) => {
      gsap.fromTo(batch, from, {
        ...to,
        stagger,
      });
    },
    start: 'top 85%',
    once: true, // Only animate once for performance
  });
}

/**
 * Refresh ScrollTrigger
 * Call after DOM changes that affect layout
 */
export function refreshScrollTrigger() {
  ScrollTrigger.refresh();
}

/**
 * Kill all ScrollTrigger instances
 * Use for cleanup
 */
export function killAllScrollTriggers() {
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
}
