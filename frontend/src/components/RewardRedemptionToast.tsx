/**
 * Reward Redemption Toast Component
 *
 * Displays a celebration toast when a customer redeems their reward.
 * Features:
 * - Smooth fade in/out animations
 * - Auto-dismiss after 8 seconds
 * - Manual dismiss button
 * - Encourages social sharing
 *
 * Usage:
 * ```tsx
 * <RewardRedemptionToast
 *   customerName="Juan Pérez"
 *   onDismiss={() => setRedemption(null)}
 * />
 * ```
 */

'use client';

import { useEffect, useState } from 'react';
import { X, PartyPopper } from 'lucide-react';

interface RewardRedemptionToastProps {
  customerName: string;
  onDismiss: () => void;
}

export function RewardRedemptionToast({
  customerName,
  onDismiss,
}: RewardRedemptionToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fade in animation
    const fadeInTimer = setTimeout(() => setIsVisible(true), 100);

    // Auto-dismiss after 8 seconds
    const autoDismissTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onDismiss, 300); // Wait for fade out animation
    }, 8000);

    return () => {
      clearTimeout(fadeInTimer);
      clearTimeout(autoDismissTimer);
    };
  }, [onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300); // Wait for fade out animation
  };

  return (
    <div
      className={`
        fixed bottom-4 right-4 z-50
        transition-all duration-300 ease-out
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="bg-gradient-to-r from-success to-success-dark text-white rounded-lg shadow-2xl p-4 max-w-md">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 mt-0.5">
            <PartyPopper className="w-6 h-6" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg mb-1">
              ¡Premio Canjeado! 🎉
            </h3>
            <p className="text-white/90 text-sm mb-2">
              <span className="font-semibold">{customerName}</span> acaba de canjear su premio
            </p>
            <p className="text-white/75 text-xs">
              Comparte su experiencia en redes sociales para atraer más clientes
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="text-white/80 hover:text-white transition-colors flex-shrink-0"
            aria-label="Cerrar notificación"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
