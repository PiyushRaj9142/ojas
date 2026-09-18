import { ThemeMode } from '../theme/colors';

export type LanguageCode = 'en' | 'hi' | 'hinglish';
export type UnitSystem = 'METRIC' | 'IMPERIAL';

export interface UserProfile {
  id: string;
  name: string;
  mobile: string;
  farmName: string;
  coldStorageId: string;
  location: string;
  totalCapacityKg: number;
  language: LanguageCode;
  tempUnit: '°C' | '°F';
  weightUnit: 'kg' | 'quintal';
  notificationsEnabled: boolean;
  darkMode: boolean;
  themeMode: ThemeMode;
  demoMode: boolean;
  isLoggedIn: boolean;
}

