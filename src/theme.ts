// Design tokens — Neon Violet Grid
// Palette: pure black base + neon violet & electric blue accent for a futuristic look


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

// Typography — Stardos Stencil font family
export const F = {
  base: 'StardosStencil',
  bold: 'StardosStencil-Bold',
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

// Neon shadow presets — spread directly into React Native style objects
// These create the glowing border effect seen in futuristic UIs
export const SH = {
  // Strong violet glow — use on primary/featured cards
  neon: {
    shadowColor: '#8A2BE2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.75,
    shadowRadius: 16,
    elevation: 12,
  },
  // Subtle violet glow — use on regular cards
  neonSubtle: {
    shadowColor: '#8A2BE2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
  },
  // Blue glow — use for secondary/info elements
  neonBlue: {
    shadowColor: '#00BFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.65,
    shadowRadius: 14,
    elevation: 10,
  },
  // Upward glow — use on bottom bars/footers
  neonUp: {
    shadowColor: '#8A2BE2',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
    elevation: 20,
  },
};
