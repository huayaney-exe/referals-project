/**
 * Seya Design System - Color Tokens
 * Modern, gradient-first color system with contextual semantics
 */

export const seyaColors = {
  // PRIMARY GRADIENT SYSTEM (Purple)
  brand: {
    whisper: '#FAF5FF',
    mist: '#F3E8FF',
    soft: '#E9D5FF',
    light: '#D8B4FE',
    medium: '#C084FC',
    primary: {
      base: '#A855F7',
      gradient: 'linear-gradient(135deg, #A855F7 0%, #C084FC 100%)',
      hover: '#9333EA',
      active: '#7E22CE',
    },
    deep: '#6B21A8',
    rich: '#581C87',
  },

  // ACCENT GRADIENT SYSTEM (Warm Orange)
  accent: {
    light: '#FB923C',
    primary: {
      base: '#F97316',
      gradient: 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)',
      hover: '#EA580C',
      active: '#DC2626',
    },
  },

  // SEMANTIC COLORS
  semantic: {
    success: {
      light: '#4ADE80',
      base: '#22C55E',
      gradient: 'linear-gradient(135deg, #22C55E 0%, #4ADE80 100%)',
      dark: '#16A34A',
    },
    info: {
      light: '#60A5FA',
      base: '#3B82F6',
      gradient: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
      dark: '#2563EB',
    },
    warning: {
      light: '#FBBF24',
      base: '#F59E0B',
      gradient: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
      dark: '#D97706',
    },
    error: {
      light: '#F87171',
      base: '#EF4444',
      gradient: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
      dark: '#DC2626',
    },
  },
} as const;

export const neutrals = {
  // WARM NEUTRALS (purple-tinted for brand cohesion)
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

  // PURE
  pure: {
    white: '#FFFFFF',
    black: '#000000',
  },
} as const;

export const gradients = {
  // BRAND GRADIENTS
  brandPrimary: 'linear-gradient(135deg, #A855F7 0%, #C084FC 100%)',
  brandSubtle: 'linear-gradient(180deg, #FAF5FF 0%, #F3E8FF 100%)',
  brandRadial: 'radial-gradient(circle at top right, #C084FC 0%, #A855F7 100%)',

  // ACCENT GRADIENTS
  cta: 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)',
  ctaHover: 'linear-gradient(135deg, #EA580C 0%, #F97316 100%)',

  // SEMANTIC GRADIENTS
  success: 'linear-gradient(135deg, #22C55E 0%, #4ADE80 100%)',
  info: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
  warning: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
  error: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',

  // SPECIAL EFFECTS
  shimmer: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
  glass: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
} as const;

export const semanticTokens = {
  // SURFACES
  surface: {
    base: neutrals.warm[50],
    raised: neutrals.pure.white,
    sunken: neutrals.warm[100],
    overlay: 'rgba(0, 0, 0, 0.5)',
    glass: 'rgba(255, 255, 255, 0.1)',
  },

  // BORDERS
  border: {
    subtle: neutrals.warm[200],
    strong: neutrals.warm[300],
    brand: seyaColors.brand.light,
    interactive: seyaColors.brand.primary.base,
  },

  // TEXT
  text: {
    primary: neutrals.warm[900],
    secondary: neutrals.warm[600],
    tertiary: neutrals.warm[500],
    disabled: neutrals.warm[400],
    inverse: neutrals.pure.white,
    brand: seyaColors.brand.primary.base,
    link: seyaColors.brand.primary.hover,
  },

  // INTERACTIVE
  interactive: {
    primary: {
      default: seyaColors.brand.primary.base,
      hover: seyaColors.brand.primary.hover,
      active: seyaColors.brand.primary.active,
      disabled: seyaColors.brand.soft,
    },
    cta: {
      default: seyaColors.accent.primary.base,
      hover: seyaColors.accent.primary.hover,
      active: seyaColors.accent.primary.active,
      disabled: seyaColors.accent.light,
    },
  },

  // FEEDBACK
  feedback: {
    success: {
      bg: '#F0FDF4',
      border: seyaColors.semantic.success.light,
      text: '#166534',
      icon: seyaColors.semantic.success.base,
    },
    error: {
      bg: '#FEF2F2',
      border: seyaColors.semantic.error.light,
      text: '#991B1B',
      icon: seyaColors.semantic.error.base,
    },
    warning: {
      bg: '#FFFBEB',
      border: seyaColors.semantic.warning.light,
      text: '#92400E',
      icon: seyaColors.semantic.warning.base,
    },
    info: {
      bg: '#EFF6FF',
      border: seyaColors.semantic.info.light,
      text: '#1E3A8A',
      icon: seyaColors.semantic.info.base,
    },
  },
} as const;

export const effects = {
  // GLASSMORPHISM
  glass: {
    light: {
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(10px) saturate(180%)',
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
    },
  },

  // NEUMORPHISM
  neumorphic: {
    light: {
      background: neutrals.warm[100],
      boxShadow: '6px 6px 12px rgba(0, 0, 0, 0.1), -6px -6px 12px rgba(255, 255, 255, 0.7)',
    },
    pressed: {
      background: neutrals.warm[100],
      boxShadow: 'inset 3px 3px 6px rgba(0, 0, 0, 0.1), inset -3px -3px 6px rgba(255, 255, 255, 0.7)',
    },
  },
} as const;
