/**
 * Seya Pricing Card Component
 * Displays pricing tier with features, CTAs, and optional badges
 */

import React from 'react';
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export interface PricingCardProps {
  tier: string;
  price: number | null;
  customPrice?: string;
  period: string;
  description: string;
  features: string[];
  ctaText: string;
  ctaHref: string;
  isPopular?: boolean;
  isPremium?: boolean;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  tier,
  price,
  customPrice,
  period,
  description,
  features,
  ctaText,
  ctaHref,
  isPopular = false,
  isPremium = false,
}) => {
  return (
    <div
      className={cn(
        'relative bg-white rounded-2xl p-8 flex flex-col',
        'transition-all duration-300',
        'hover:shadow-xl hover:-translate-y-1',
        isPremium
          ? 'shadow-xl border-3 border-transparent bg-gradient-to-br from-purple-100 via-white to-orange-50'
          : 'shadow-md border border-warm-200'
      )}
    >
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-gradient-cta text-white shadow-lg">
            Más Popular
          </span>
        </div>
      )}

      {/* Tier Name */}
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-warm-900 uppercase tracking-wide">{tier}</h3>
        <p className="text-sm text-warm-600 mt-1">{description}</p>
      </div>

      {/* Price */}
      <div className="text-center mb-6">
        {price !== null ? (
          <>
            <div className="flex items-start justify-center gap-1">
              <span className="text-2xl font-bold text-warm-900 mt-2">S/</span>
              <span className="text-5xl font-bold text-warm-900">{price}</span>
            </div>
            <p className="text-sm text-warm-600 mt-1">{period}</p>
          </>
        ) : (
          <>
            <div className="text-3xl font-bold text-warm-900">{customPrice}</div>
            <p className="text-sm text-warm-600 mt-1">{period}</p>
          </>
        )}
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-8 flex-grow">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span className="text-base text-warm-700">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link
        href={ctaHref}
        className={cn(
          'inline-flex items-center justify-center gap-2',
          'w-full px-6 py-3.5 rounded-xl',
          'font-semibold text-base',
          'transition-all duration-200',
          'focus:outline-none focus:ring-3 focus:ring-offset-2',
          isPremium
            ? 'bg-gradient-cta text-white hover:shadow-lg hover:shadow-accent/40 hover:-translate-y-0.5 focus:ring-accent'
            : 'bg-gradient-brand text-white hover:shadow-lg hover:shadow-brand/40 hover:-translate-y-0.5 focus:ring-brand'
        )}
      >
        {ctaText}
      </Link>
    </div>
  );
};
