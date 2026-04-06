// Design tokens — Dark Artisan Premium
// Palette inspired by raw paint pigments: warm charcoal base + amber/ochre accent

export const C = {
  // Backgrounds
  bgDeep:     '#0F0D0A',   // deepest background
  bgBase:     '#171410',   // page background
  bgSurface:  '#201D18',   // card / surface
  bgElevated: '#2A261F',   // elevated cards, inputs
  bgMuted:    '#312D25',   // hover / pressed state

  // Accent — warm amber / ochre (paint pigment)
  amber:      '#D4862A',   // primary accent
  amberLight: '#E9A84C',   // hover / highlight
  amberDeep:  '#A8671A',   // pressed / shadow
  amberGlow:  '#D4862A22', // translucent amber for badges / overlays

  // Terracotta secondary
  terra:      '#C04E28',
  terraLight: '#D96B43',

  // Text
  textPrimary:   '#F2EDE3',  // warm cream
  textSecondary: '#A09280',  // muted warm
  textDisabled:  '#5C5448',  // disabled

  // Border / divider
  border:     '#2E2922',
  borderSoft: '#252019',

  // Status colours (kept readable on dark)
  success:    '#4ABA79',
  warning:    '#E9A84C',
  error:      '#E05252',
  info:       '#5AAAE0',

  // Status badge bg (translucent)
  successBg:  '#4ABA7920',
  warningBg:  '#E9A84C20',
  errorBg:    '#E0525220',
  infoBg:     '#5AAAE020',

  // Utility
  white:   '#FFFFFF',
  black:   '#000000',
  overlay: 'rgba(0,0,0,0.55)',
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
