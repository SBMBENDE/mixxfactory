/**
 * Scroll Reveal Section
 * 
 * Animation Strategy:
 * - Reveals content as user scrolls into view
 * - Stagger children for progressive disclosure
 * - One-time animation for performance
 * 
 * UX Benefits:
 * ✓ Guides user attention down the page
 * ✓ Creates sense of discovery
 * ✓ Reduces cognitive load (progressive)
 * ✓ Performance optimized (once: true)
 */

'use client';

import { useRef, useEffect, ReactNode } from 'react';
import { useReducedMotion } from '@/hooks/useGSAP';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollRevealProps {
  children: ReactNode;
  animation?: 'fadeUp' | 'fadeIn' | 'slideLeft' | 'slideRight' | 'scaleUp';
  stagger?: number;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function ScrollReveal({
  children,
  animation = 'fadeUp',
  stagger = 0.15,
  delay = 0,
  className = '',
  style = {},
}: ScrollRevealProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion || !sectionRef.current) return;

    const section = sectionRef.current;
    const children = section.children;

    if (children.length === 0) return;

    // Animation presets
    const animations = {
      fadeUp: {
        from: { opacity: 0, y: 60 },
        to: { opacity: 1, y: 0, ease: 'power3.out', duration: 0.8 },
      },
      fadeIn: {
        from: { opacity: 0 },
        to: { opacity: 1, ease: 'power2.out', duration: 0.6 },
      },
      slideLeft: {
        from: { opacity: 0, x: -60 },
        to: { opacity: 1, x: 0, ease: 'power3.out', duration: 0.8 },
      },
      slideRight: {
        from: { opacity: 0, x: 60 },
        to: { opacity: 1, x: 0, ease: 'power3.out', duration: 0.8 },
      },
      scaleUp: {
        from: { opacity: 0, scale: 0.8 },
        to: { opacity: 1, scale: 1, ease: 'back.out(1.2)', duration: 0.7 },
      },
    };

    const { from, to } = animations[animation];

    // Set initial state
    gsap.set(children, from);

    // Create scroll trigger
    ScrollTrigger.create({
      trigger: section,
      start: 'top 85%',
      onEnter: () => {
        gsap.to(children, {
          ...to,
          stagger,
          delay,
        });
      },
      once: true, // Only animate once
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === section) {
          trigger.kill();
        }
      });
    };
  }, [animation, stagger, delay, prefersReducedMotion]);

  return (
    <div ref={sectionRef} className={className} style={style}>
      {children}
    </div>
  );
}
