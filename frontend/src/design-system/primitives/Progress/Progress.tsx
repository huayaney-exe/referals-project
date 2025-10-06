/**
 * Seya Progress Component
 * Modern progress bar with gradient and animation
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0-100
  max?: number;
  showLabel?: boolean;
  variant?: 'brand' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
}

const progressVariants = {
  brand: 'bg-gradient-brand',
  success: 'bg-gradient-success',
  warning: 'bg-gradient-warning',
  error: 'bg-gradient-error',
};

const progressSizes = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      value,
      max = 100,
      showLabel = false,
      variant = 'brand',
      size = 'md',
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        {showLabel && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-warm-700">
              {value}/{max}
            </span>
            <span className="text-sm font-semibold text-brand">{Math.round(percentage)}%</span>
          </div>
        )}

        <div
          className={cn(
            'w-full rounded-full overflow-hidden',
            'bg-warm-200',
            progressSizes[size]
          )}
        >
          <div
            className={cn(
              'h-full rounded-full',
              'transition-all duration-500 ease-spring',
              progressVariants[variant]
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);

Progress.displayName = 'Progress';
