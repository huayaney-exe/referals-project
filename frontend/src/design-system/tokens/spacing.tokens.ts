/**
 * Seya Design System - Spacing Tokens
 * Base unit: 4px for consistent spacing rhythm
 */

export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',   // DEFAULT padding/margin
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
  32: '128px',
} as const;

export const spacingUsage = {
  button: {
    padding: `${spacing[3]} ${spacing[6]}`,  // 12px 24px
    gap: spacing[2],  // 8px
  },
  card: {
    padding: spacing[6],  // 24px
  },
  section: {
    margin: spacing[16],  // 64px
  },
  input: {
    padding: `${spacing[3]} ${spacing[4]}`,  // 12px 16px
  },
  icon: {
    margin: spacing[2],  // 8px
  },
} as const;
