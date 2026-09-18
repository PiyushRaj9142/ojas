export type ThemeMode = 'LIGHT' | 'DARK' | 'MILD';

export interface ThemePalette {
  mode: ThemeMode;
  name: string;
  nameHi: string;
  description: string;
  statusBarStyle: 'dark' | 'light';

  // Backgrounds & Surfaces
  background: string;
  backgroundSubtle: string;
  card: string;
  cardSubtle: string;
  cardHover: string;
  modalOverlay: string;

  // Primary Brand Colors (Agriculture Green)
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primaryGlow: string;

  // Secondary Energy & Cooling (Cooling Frost / Sky)
  secondary: string;
  secondaryDark: string;
  secondaryLight: string;
  secondaryGlow: string;

  // Accent Colors (Wind / Solar / Mandi Gold)
  accent: string;
  accentLight: string;
  accentGlow: string;

  // Status Colors
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  danger: string;
  dangerLight: string;
  info: string;
  infoLight: string;

  // High-Contrast Typography
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textLight: string;
  textWhite: string;

  // Borders & Outlines
  border: string;
  borderLight: string;
  borderDark: string;

  // Shadows
  shadowColor: string;

  // Visual Gradients
  gradientGreen: [string, string];
  gradientBlue: [string, string];
  gradientEnergy: [string, string];
  gradientWarm: [string, string];
  gradientCard: [string, string];
  gradientDarkHero: [string, string];
  gradientMildHero: [string, string];
}

// 1. LIGHT THEME (दिन का समय / High-Contrast Sunlight Mode)
export const lightTheme: ThemePalette = {
  mode: 'LIGHT',
  name: 'Day Sunlight',
  nameHi: 'दिन / धूप मोड',
  description: 'High contrast clarity for bright outdoor fields',
  statusBarStyle: 'dark',

  background: '#f8fafc',
  backgroundSubtle: '#f1f5f9',
  card: '#ffffff',
  cardSubtle: '#f8fafc',
  cardHover: '#f1f5f9',
  modalOverlay: 'rgba(15, 23, 42, 0.65)',

  primary: '#16a34a',
  primaryDark: '#15803d',
  primaryLight: '#dcfce7',
  primaryGlow: 'rgba(22, 163, 74, 0.15)',

  secondary: '#0284c7',
  secondaryDark: '#0369a1',
  secondaryLight: '#e0f2fe',
  secondaryGlow: 'rgba(2, 132, 199, 0.15)',

  accent: '#d97706',
  accentLight: '#fef3c7',
  accentGlow: 'rgba(217, 119, 6, 0.15)',

  success: '#16a34a',
  successLight: '#dcfce7',
  warning: '#f59e0b',
  warningLight: '#fef3c7',
  danger: '#ef4444',
  dangerLight: '#fee2e2',
  info: '#0284c7',
  infoLight: '#e0f2fe',

  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#64748b',
  textLight: '#94a3b8',
  textWhite: '#ffffff',

  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  borderDark: '#cbd5e1',

  shadowColor: '#0f172a',

  gradientGreen: ['#16a34a', '#15803d'],
  gradientBlue: ['#0284c7', '#0369a1'],
  gradientEnergy: ['#0284c7', '#16a34a'],
  gradientWarm: ['#f59e0b', '#d97706'],
  gradientCard: ['#ffffff', '#f8fafc'],
  gradientDarkHero: ['#0f172a', '#1e293b'],
  gradientMildHero: ['#292524', '#44403c'],
};

// 2. DARK THEME (रात का समय / Deep Night & Mandi Low-Light Mode)
export const darkTheme: ThemePalette = {
  mode: 'DARK',
  name: 'Night Mandi',
  nameHi: 'रात / मंडी मोड',
  description: 'Deep OLED dark, saves battery and prevents glare in the dark',
  statusBarStyle: 'light',

  background: '#090e17',
  backgroundSubtle: '#0f172a',
  card: '#131e33',
  cardSubtle: '#182742',
  cardHover: '#1e3256',
  modalOverlay: 'rgba(0, 0, 0, 0.85)',

  primary: '#22c55e',
  primaryDark: '#16a34a',
  primaryLight: '#052e16',
  primaryGlow: 'rgba(34, 197, 94, 0.25)',

  secondary: '#38bdf8',
  secondaryDark: '#0284c7',
  secondaryLight: '#082f49',
  secondaryGlow: 'rgba(56, 189, 248, 0.25)',

  accent: '#fbbf24',
  accentLight: '#451a03',
  accentGlow: 'rgba(251, 191, 36, 0.25)',

  success: '#22c55e',
  successLight: '#052e16',
  warning: '#fbbf24',
  warningLight: '#451a03',
  danger: '#f87171',
  dangerLight: '#450a0a',
  info: '#38bdf8',
  infoLight: '#082f49',

  textPrimary: '#f8fafc',
  textSecondary: '#cbd5e1',
  textMuted: '#94a3b8',
  textLight: '#64748b',
  textWhite: '#ffffff',

  border: '#1e293b',
  borderLight: '#182438',
  borderDark: '#334155',

  shadowColor: '#000000',

  gradientGreen: ['#16a34a', '#14532d'],
  gradientBlue: ['#0284c7', '#0c4a6e'],
  gradientEnergy: ['#0369a1', '#15803d'],
  gradientWarm: ['#d97706', '#78350f'],
  gradientCard: ['#131e33', '#0f172a'],
  gradientDarkHero: ['#050a12', '#0f172a'],
  gradientMildHero: ['#1c1917', '#292524'],
};

// 3. MILD THEME (आरामदेह / Warm Sepia Eye-Comfort Mode)
export const mildTheme: ThemePalette = {
  mode: 'MILD',
  name: 'Warm Earth / Eye Comfort',
  nameHi: 'आरामदेह / सुखद मोड',
  description: 'Soothing amber/sepia palette for dusk, dawn and reading comfort',
  statusBarStyle: 'dark',

  background: '#fbf7ee',
  backgroundSubtle: '#f3ece0',
  card: '#ffffff',
  cardSubtle: '#f8f1e5',
  cardHover: '#eee4d4',
  modalOverlay: 'rgba(41, 37, 36, 0.70)',

  primary: '#15803d',
  primaryDark: '#166534',
  primaryLight: '#ecf8ec',
  primaryGlow: 'rgba(21, 128, 61, 0.15)',

  secondary: '#0e7490',
  secondaryDark: '#155e75',
  secondaryLight: '#e0f4f8',
  secondaryGlow: 'rgba(14, 116, 144, 0.15)',

  accent: '#c2410c',
  accentLight: '#ffedd5',
  accentGlow: 'rgba(194, 65, 12, 0.15)',

  success: '#15803d',
  successLight: '#ecf8ec',
  warning: '#d97706',
  warningLight: '#fef3c7',
  danger: '#dc2626',
  dangerLight: '#fee2e2',
  info: '#0e7490',
  infoLight: '#e0f4f8',

  textPrimary: '#292524',
  textSecondary: '#57534e',
  textMuted: '#78716c',
  textLight: '#a8a29e',
  textWhite: '#ffffff',

  border: '#e7dfd3',
  borderLight: '#f0e8dc',
  borderDark: '#d4c7b5',

  shadowColor: '#44403c',

  gradientGreen: ['#15803d', '#14532d'],
  gradientBlue: ['#0e7490', '#155e75'],
  gradientEnergy: ['#0e7490', '#15803d'],
  gradientWarm: ['#d97706', '#b45309'],
  gradientCard: ['#ffffff', '#fbf7ee'],
  gradientDarkHero: ['#292524', '#44403c'],
  gradientMildHero: ['#292524', '#44403c'],
};

// Default export backward compatibility
export const colors = lightTheme;

export const getTheme = (mode: ThemeMode): ThemePalette => {
  switch (mode) {
    case 'DARK':
      return darkTheme;
    case 'MILD':
      return mildTheme;
    case 'LIGHT':
    default:
      return lightTheme;
  }
};
