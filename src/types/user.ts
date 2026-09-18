import { ThemeMode } from '../theme/colors';

export type LanguageCode =
  | 'en' // English
  | 'hi' // हिन्दी (Hindi)
  | 'bn' // বাংলা (Bengali)
  | 'mr' // मराठी (Marathi)
  | 'te' // తెలుగు (Telugu)
  | 'ta' // தமிழ் (Tamil)
  | 'gu' // ગુજરાતી (Gujarati)
  | 'kn' // ಕನ್ನಡ (Kannada)
  | 'ml' // മലയാളം (Malayalam)
  | 'pa' // ਪੰਜਾਬੀ (Punjabi)
  | 'or' // ଓଡ଼ିଆ (Odia)
  | 'hinglish'; // हिंग्लिश (Hinglish)

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeName: string;
  region: string;
  flag: string;
}

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

