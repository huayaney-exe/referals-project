/**
 * Seya Button Component
 * Modern gradient-first button system with variants
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'cta' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const buttonVariants = {
  primary: `
    bg-gradient-brand text-white !text-white
    hover:shadow-lg hover:shadow-brand/40 hover:-translate-y-0.5
    active:translate-y-0 active:shadow-md
    disabled:bg-brand-soft disabled:text-warm-400 disabled:cursor-not-allowed disabled:transform-none
    transition-all duration-200 ease-out
  `,
  cta: `
    bg-gradient-cta text-white !text-white
    hover:shadow-lg hover:shadow-accent/40 hover:-translate-y-0.5
    active:translate-y-0 active:shadow-md
    disabled:bg-accent-light disabled:text-warm-400 disabled:cursor-not-allowed disabled:transform-none
    transition-all duration-200 ease-out
  `,
  secondary: `
    bg-white text-brand border-2 border-brand
    hover:bg-brand-whisper hover:shadow-md
    active:bg-brand-mist
    disabled:bg-warm-100 disabled:text-warm-400 disabled:border-warm-200 disabled:cursor-not-allowed
    transition-all duration-200 ease-out
  `,
  ghost: `
    bg-transparent text-brand
    hover:bg-brand-whisper
    active:bg-brand-mist
    disabled:text-warm-400 disabled:cursor-not-allowed
    transition-all duration-200 ease-out
  `,
};

const buttonSizes = {
  sm: 'px-4 py-2 text-sm rounded-lg',
  md: 'px-6 py-3 text-base rounded-lg',
  lg: 'px-8 py-4 text-lg rounded-xl',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center gap-2',
          'font-semibold',
          'focus:outline-none focus:ring-3 focus:ring-brand focus:ring-offset-2',
          buttonVariants[variant],
          buttonSizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : leftIcon}
        {children}
        {rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
