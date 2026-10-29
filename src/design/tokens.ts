/**
 * TRANSPLANT SAATHI — STRICT BLUE-AND-WHITE DESIGN TOKENS
 *
 * Rules:
 * - Blue is the primary brand and interaction color.
 * - White is the main surface color.
 * - Ice blue is for subtle secondary sections.
 * - Navy and slate are for readable text.
 * - Borders: #E2E8F0.
 * - Absolutely NO green, teal, beige, cream, purple, orange, neon gradients, or generic decoration.
 */

export const BRAND_COLORS = {
  white: '#FFFFFF',
  iceBlue: '#F4F8FF',
  primaryBlue: '#2563EB',
  deepBlue: '#1D4ED8',
  navy: '#0F172A',
  slate: '#64748B',
  border: '#E2E8F0',
} as const;

export const TYPOGRAPHY = {
  fontSans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontHeading: '"Manrope", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  sizes: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
  }
} as const;

export const SPACING = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
} as const;

export const BORDER_RADIUS = {
  sm: '0.375rem',  // 6px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px',
} as const;

export const SHADOWS = {
  xs: '0 1px 2px 0 rgba(15, 23, 42, 0.05)',
  sm: '0 1px 3px 0 rgba(15, 23, 42, 0.08), 0 1px 2px -1px rgba(15, 23, 42, 0.08)',
  md: '0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.06)',
  lg: '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)',
} as const;

export const FOCUS_RING = 'focus-visible:outline-2 focus-visible:outline-[#2563EB] focus-visible:outline-offset-2';
export const CARD_STYLES = 'bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs';
