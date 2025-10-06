'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface PromotionalBannerProps {
  message: string;
  onClick?: () => void;
  dismissible?: boolean;
  storageKey?: string;
}

/**
 * Lean promotional banner component (e-commerce style)
 * - Fixed positioning at top of viewport
 * - Entire banner is clickable (no separate button)
 * - Dismissible with localStorage persistence
 * - Centered text for clean presentation
 * - Slim height (40px) for minimal space usage
 */
export function PromotionalBanner({
  message,
  onClick,
  dismissible = true,
  storageKey = 'dismissed_launch_banner',
}: PromotionalBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(storageKey);
      if (!dismissed) {
        setIsVisible(true);
      }
    } catch (error) {
      setIsVisible(true);
    }
  }, [storageKey]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAnimatingOut(true);
    setTimeout(() => {
      setIsVisible(false);
      try {
        localStorage.setItem(storageKey, 'true');
      } catch (error) {
        console.warn('Unable to persist banner dismissal:', error);
      }
    }, 300);
  };

  if (!isVisible) return null;

  const bannerClasses = `
    fixed top-0 left-0 right-0 z-[100]
    bg-gradient-to-r from-purple-600 to-orange-500
    text-white
    transition-all duration-300 ease-in-out
    ${isAnimatingOut ? '-translate-y-full' : 'translate-y-0'}
    ${onClick ? 'cursor-pointer hover:brightness-110' : ''}
  `;

  const contentClasses = `
    max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
    flex items-center justify-center
    h-10
    relative
  `;

  const BannerContent = (
    <>
      <div className="flex-1 text-center">
        <span className="font-semibold text-sm">{message}</span>
      </div>
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="
            absolute right-3 top-1/2 -translate-y-1/2
            text-white/80 hover:text-white
            transition-colors
            p-1 rounded-md hover:bg-white/10
          "
          aria-label="Cerrar banner"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className={bannerClasses}>
        <div className={contentClasses}>{BannerContent}</div>
      </button>
    );
  }

  return (
    <div className={bannerClasses}>
      <div className={contentClasses}>{BannerContent}</div>
    </div>
  );
}
