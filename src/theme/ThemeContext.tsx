import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeMode, ThemePalette, getTheme, lightTheme } from './colors';

interface ThemeContextType {
  themeMode: ThemeMode;
  theme: ThemePalette;
  setThemeMode: (mode: ThemeMode) => void;
  cycleTheme: () => void;
}

const THEME_STORAGE_KEY = '@ojas_farmer_theme_mode';

const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'LIGHT',
  theme: lightTheme,
  setThemeMode: () => {},
  cycleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('LIGHT');

  useEffect(() => {
    // Load stored theme preference
    const loadStoredTheme = async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (stored === 'LIGHT' || stored === 'DARK' || stored === 'MILD') {
          setThemeModeState(stored as ThemeMode);
        }
      } catch (e) {
        // Fallback to default
      }
    };
    loadStoredTheme();
  }, []);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem(THEME_STORAGE_KEY, mode).catch(() => {});
  };

  const cycleTheme = () => {
    setThemeModeState((prev) => {
      let next: ThemeMode = 'LIGHT';
      if (prev === 'LIGHT') next = 'DARK';
      else if (prev === 'DARK') next = 'MILD';
      else next = 'LIGHT';
      AsyncStorage.setItem(THEME_STORAGE_KEY, next).catch(() => {});
      return next;
    });
  };

  const theme = getTheme(themeMode);

  return (
    <ThemeContext.Provider value={{ themeMode, theme, setThemeMode, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
