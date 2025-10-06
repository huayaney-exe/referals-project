import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Seya Brand - Primary Gradient System
        brand: {
          whisper: '#FAF5FF',
          mist: '#F3E8FF',
          soft: '#E9D5FF',
          light: '#D8B4FE',
          medium: '#C084FC',
          DEFAULT: '#A855F7',
          hover: '#9333EA',
          active: '#7E22CE',
          deep: '#6B21A8',
          rich: '#581C87',
        },
        // Accent - Warm Orange
        accent: {
          light: '#FB923C',
          DEFAULT: '#F97316',
          hover: '#EA580C',
          active: '#DC2626',
        },
        // Semantic Colors
        success: {
          light: '#4ADE80',
          DEFAULT: '#22C55E',
          dark: '#16A34A',
        },
        info: {
          light: '#60A5FA',
          DEFAULT: '#3B82F6',
          dark: '#2563EB',
        },
        warning: {
          light: '#FBBF24',
          DEFAULT: '#F59E0B',
          dark: '#D97706',
        },
        error: {
          light: '#F87171',
          DEFAULT: '#EF4444',
          dark: '#DC2626',
        },
        // Warm Neutrals (purple-tinted)
        warm: {
          50: '#FAFAF9',
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#D6D3D1',
          400: '#A8A29E',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
        },
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #A855F7 0%, #C084FC 100%)',
        'gradient-brand-subtle': 'linear-gradient(180deg, #FAF5FF 0%, #F3E8FF 100%)',
        'gradient-cta': 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)',
        'gradient-success': 'linear-gradient(135deg, #22C55E 0%, #4ADE80 100%)',
        'gradient-radial': 'radial-gradient(circle at top right, #C084FC 0%, #A855F7 100%)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
        'neumorphic': '6px 6px 12px rgba(0, 0, 0, 0.1), -6px -6px 12px rgba(255, 255, 255, 0.7)',
        'neumorphic-pressed': 'inset 3px 3px 6px rgba(0, 0, 0, 0.1), inset -3px -3px 6px rgba(255, 255, 255, 0.7)',
      },
      backdropBlur: {
        'glass': '10px',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        '6xl': ['60px', { lineHeight: '1.0', fontWeight: '700' }],
        '5xl': ['48px', { lineHeight: '1.1', fontWeight: '700' }],
        '4xl': ['36px', { lineHeight: '1.2', fontWeight: '700' }],
        '3xl': ['30px', { lineHeight: '1.2', fontWeight: '700' }],
        '2xl': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'xl': ['20px', { lineHeight: '1.4', fontWeight: '600' }],
        'lg': ['18px', { lineHeight: '1.5', fontWeight: '600' }],
        'base': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'sm': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'xs': ['12px', { lineHeight: '1.4', fontWeight: '400' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'slide-up': 'slide-up 0.4s ease-out',
        'fade-in': 'fade-in 0.3s ease-in',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
