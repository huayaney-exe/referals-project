/**
 * Seya Design System - Motion Tokens
 * Physics-based animation system
 */

export const duration = {
  instant: 100,   // ms - Feedback inmediato
  fast: 200,      // ms - Transitions
  base: 300,      // ms - Default
  slow: 500,      // ms - Entrance/exit
} as const;

export const easing = {
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',  // DEFAULT
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',  // Playful
} as const;

export const transitions = {
  button: {
    all: `all ${duration.fast}ms ${easing.out}`,
    transform: `transform ${duration.fast}ms ${easing.out}`,
    boxShadow: `box-shadow ${duration.fast}ms ${easing.out}`,
  },
  card: {
    boxShadow: `box-shadow ${duration.base}ms ${easing.inOut}`,
  },
  progress: {
    width: `width ${duration.slow}ms ${easing.spring}`,
  },
  page: {
    fade: `opacity ${duration.base}ms ${easing.inOut}`,
    slide: `transform ${duration.slow}ms ${easing.out}`,
  },
} as const;
