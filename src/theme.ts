// Design tokens — Luxury Gold
// Palette: deep black base + gold accent for a sophisticated premium look

import { Platform } from 'react-native';

export const C = {
  // Backgrounds
  bgDeep:     '#121212',   // deepest background  (luxury-black)
  bgBase:     '#121212',   // page background      (luxury-black)
  bgSurface:  '#1E1E1E',   // card / surface       (luxury-dark-grey)
  bgElevated: '#252525',   // elevated cards, inputs
  bgMuted:    '#2A2A2A',   // hover / pressed state

  // Accent — Luxury Gold
  amber:      '#D4AF37',   // primary gold accent   (luxury-gold)
  amberLight: '#E0B95B',   // hover / highlight     (luxury-light-gold)
  amberDeep:  '#B8960C',   // pressed / deep gold   (luxury-deep-gold)
  amberGlow:  '#D4AF3722', // translucent gold for badges / overlays

  // Warm secondary (kept harmonious with gold)
  terra:      '#C09040',
  terraLight: '#D4AA5A',

  // Service palette
  blue:       '#5AAAE0',
  blueBg:     '#5AAAE020',
  purple:     '#A04ABA',
  purpleBg:   '#A04ABA20',
  green:      '#4ABA79',
  greenBg:    '#4ABA7920',
  whatsapp:   '#25D366',
  whatsappBg: '#25D36620',

  // Text
  textPrimary:   '#F5F5F5',  // luxury-text-light
  textSecondary: '#A0A0A0',  // luxury-text-dark
  textDisabled:  '#5A5A5A',  // disabled

  // Border / divider
  border:     '#2A2A2A',
  borderSoft: '#222222',

  // Status colours
  success:    '#4ABA79',
  warning:    '#E0B95B',
  error:      '#E05252',
  info:       '#5AAAE0',

  // Status badge bg (translucent)
  successBg:  '#4ABA7920',
  warningBg:  '#E0B95B20',
  errorBg:    '#E0525220',
  infoBg:     '#5AAAE020',

  // Utility
  white:   '#FFFFFF',
  black:   '#000000',
  overlay: 'rgba(0,0,0,0.65)',
};

// Typography — Inter on web, system on native
export const F = {
  base: Platform.select({
    web:     'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    ios:     'System',
    android: 'Roboto',
    default: 'System',
  }) as string,
};

// Gradient presets
export const G = {
  amber:   [C.amberDeep, C.amber, C.amberLight] as const,
  amberH:  [C.amberDeep, C.amberLight] as const,  // horizontal
  dark:    [C.bgDeep, C.bgBase, C.bgSurface] as const,
  surface: [C.bgSurface, C.bgElevated] as const,
  terra:   [C.terra, C.terraLight] as const,
};

// Radii
export const R = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  full: 999,
};

// Spacing
export const S = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};
