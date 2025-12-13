/**
 * Mobile-optimized utilities for touch gestures and responsive behavior
 */

import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * Hook to detect touch gestures (swipe, long press)
 */
export function useTouchGestures(
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  onLongPress?: () => void
) {
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);
  const longPressTimer = useRef<NodeJS.Timeout>();

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX || 0;
    touchStartY.current = e.touches[0]?.clientY || 0;
    touchStartTime.current = Date.now();

    // Start long press detection (500ms)
    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        onLongPress();
      }, 500);
    }
  }, [onLongPress]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    // Clear long press timer if we have a touch end
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    const touchEndX = e.changedTouches[0]?.clientX || 0;
    const touchEndY = e.changedTouches[0]?.clientY || 0;
    const deltaX = touchEndX - touchStartX.current;
    const deltaY = touchEndY - touchStartY.current;
    const deltaTime = Date.now() - touchStartTime.current;

    // Only register swipe if it's a quick gesture (< 300ms)
    if (deltaTime > 300) return;

    // Minimum swipe distance
    const minSwipeDistance = 50;
    const maxSwipeDeltaY = 100;

    // Horizontal swipe detection
    if (Math.abs(deltaX) > minSwipeDistance && Math.abs(deltaY) < maxSwipeDeltaY) {
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }
  }, [onSwipeLeft, onSwipeRight]);

  return { onTouchStart: handleTouchStart, onTouchEnd: handleTouchEnd };
}

/**
 * Hook to prevent body scroll on mobile (useful for modals, drawers)
 */
export function usePreventBodyScroll() {
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);
}

/**
 * Hook to detect if app is running standalone (installed PWA)
 */
export function useStandaloneMode() {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);
  }, []);

  return isStandalone;
}
