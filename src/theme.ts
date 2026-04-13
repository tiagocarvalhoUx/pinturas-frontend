// Design tokens — Neon Violet Grid
// Palette: pure black base + neon violet & electric blue accent for a futuristic look

import { Platform } from 'react-native';

export const C = {
  // Backgrounds
  bgDeep:     '#000000',   // deepest background  (neon-black)
  bgBase:     '#000000',   // page background      (neon-black)
  bgSurface:  '#1A1A1A',   // card / surface       (neon-dark-grey)
  bgElevated: '#222222',   // elevated cards, inputs
  bgMuted:    '#2A2A2A',   // hover / pressed state

  // Accent — Neon Violet (primary)
  amber:      '#8A2BE2',   // neon-violet (primary accent)
  amberLight: '#A855F7',   // lighter violet for hover/highlight
  amberDeep:  '#6A1ABE',   // darker violet for pressed/shadow
  amberGlow:  '#8A2BE222', // translucent violet for badges/overlays

  // Secondary — Electric Blue
  terra:      '#0000FF',   // neon-blue
  terraLight: '#00BFFF',   // neon-light-blue

  // Service palette
  blue:       '#00BFFF',
  blueBg:     '#00BFFF20',
  purple:     '#8A2BE2',
  purpleBg:   '#8A2BE220',
  green:      '#4ABA79',
  greenBg:    '#4ABA7920',
  whatsapp:   '#25D366',
  whatsappBg: '#25D36620',

  // Text
  textPrimary:   '#E0E0E0',  // neon-text-light
  textSecondary: '#A0A0A0',  // neon-text-dark
  textDisabled:  '#4A4A4A',  // disabled

  // Border / divider
  border:     '#8A2BE240',   // violet border (subtle)
  borderSoft: '#1A1A1A',

  // Status colours
  success:    '#4ABA79',
  warning:    '#E0B95B',
  error:      '#E05252',
  info:       '#00BFFF',

  // Status badge bg (translucent)
  successBg:  '#4ABA7920',
  warningBg:  '#E0B95B20',
  errorBg:    '#E0525220',
  infoBg:     '#00BFFF20',

  // Utility
  white:   '#FFFFFF',
  black:   '#000000',
  overlay: 'rgba(0,0,0,0.75)',
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
  amber:   [C.amberDeep, C.amber, C.amberLight] as const,   // violet gradient
  amberH:  [C.amber, C.terra] as const,                      // violet → blue horizontal
  dark:    [C.bgDeep, C.bgBase, C.bgSurface] as const,
  surface: [C.bgSurface, C.bgElevated] as const,
  terra:   [C.terra, C.terraLight] as const,                  // blue gradient
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
