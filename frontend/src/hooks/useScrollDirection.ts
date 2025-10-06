'use client';

import { useState, useEffect } from 'react';

export type ScrollDirection = 'up' | 'down' | 'top';

interface UseScrollDirectionOptions {
  threshold?: number;
  topThreshold?: number;
}

/**
 * Hook to detect scroll direction for implementing auto-hiding navigation
 * @param threshold - Minimum scroll distance to trigger direction change (default: 10px)
 * @param topThreshold - Distance from top to consider "at top" (default: 100px)
 * @returns Current scroll direction ('up', 'down', or 'top')
 */
export function useScrollDirection({
  threshold = 10,
  topThreshold = 100,
}: UseScrollDirectionOptions = {}): ScrollDirection {
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>('top');
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;

    const updateScrollDirection = () => {
      const scrollY = window.scrollY;

      // Always show at top of page
      if (scrollY < topThreshold) {
        setScrollDirection('top');
      }
      // Scrolling up
      else if (scrollY < lastScrollY - threshold) {
        setScrollDirection('up');
      }
      // Scrolling down
      else if (scrollY > lastScrollY + threshold) {
        setScrollDirection('down');
      }

      setLastScrollY(scrollY);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [lastScrollY, threshold, topThreshold]);

  return scrollDirection;
}
