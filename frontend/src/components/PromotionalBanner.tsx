'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';

interface PromotionalBannerProps {
  message: string;
  subMessage?: string;
  ctaText?: string;
  onCtaClick?: () => void;
  dismissible?: boolean;
  storageKey?: string;
}

/**
 * Promotional banner component for announcements
 * - Fixed positioning at top of viewport
 * - Dismissible with localStorage persistence
 * - Smooth animations
 * - Responsive design
 */
export function PromotionalBanner({
  message,
  subMessage,
  ctaText,
  onCtaClick,
  dismissible = true,
  storageKey = 'dismissed_launch_banner',
}: PromotionalBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    // Check if banner was previously dismissed
    try {
      const dismissed = localStorage.getItem(storageKey);
      if (!dismissed) {
        setIsVisible(true);
      }
    } catch (error) {
      // localStorage might not be available (e.g., private browsing)
      setIsVisible(true);
    }
  }, [storageKey]);

  const handleDismiss = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      setIsVisible(false);
      try {
        localStorage.setItem(storageKey, 'true');
      } catch (error) {
        // Fail silently if localStorage is not available
        console.warn('Unable to persist banner dismissal:', error);
      }
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`
        fixed top-0 left-0 right-0 z-[100]
        bg-gradient-to-r from-purple-600 to-orange-500
        text-white px-4 py-3 md:py-2
        transition-transform duration-300 ease-in-out
        ${isAnimatingOut ? '-translate-y-full' : 'translate-y-0'}
      `}
      role="banner"
      aria-label="Promotional announcement"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Sparkles className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm md:text-base truncate">{message}</p>
            {subMessage && (
              <p className="text-xs md:text-sm text-purple-100 truncate">{subMessage}</p>
            )}
          </div>
        </div>

        {ctaText && onCtaClick && (
          <button
            onClick={onCtaClick}
            className="
              hidden sm:block
              bg-white text-purple-600
              px-4 py-1 rounded-full
              text-sm font-semibold
              hover:bg-purple-50 transition-colors
              whitespace-nowrap
            "
            aria-label={ctaText}
          >
            {ctaText}
          </button>
        )}

        {dismissible && (
          <button
            onClick={handleDismiss}
            className="
              flex-shrink-0 w-11 h-11 -mr-2
              flex items-center justify-center
              hover:bg-white/10 rounded-full
              transition-colors
            "
            aria-label="Dismiss banner"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
