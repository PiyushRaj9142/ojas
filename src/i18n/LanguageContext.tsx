import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Text, TextProps } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LanguageCode, LanguageOption } from '../types/user';
import { translations, TranslationKey, INDIAN_LANGUAGES } from './translations';
import { TranslationService } from '../services/translationService';

interface LanguageContextType {
  language: LanguageCode;
  languages: LanguageOption[];
  setLanguage: (lang: LanguageCode) => void;
  cycleLanguage: () => void;
  t: (key: TranslationKey, defaultText?: string) => string;
  translateDynamic: (text: string) => Promise<string>;
}

const LANGUAGE_STORAGE_KEY = '@ojas_app_language_preference_v3';

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  languages: INDIAN_LANGUAGES,
  setLanguage: () => {},
  cycleLanguage: () => {},
  t: (key: TranslationKey, defaultText?: string) => defaultText || key,
  translateDynamic: async (text: string) => text,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>('en');

  // Synchronize document attribute for web font switching
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
      document.documentElement.setAttribute('data-lang', language);
    }
  }, [language]);

  // Load persisted language on mount
  useEffect(() => {
    const loadStoredLanguage = async () => {
      try {
        const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (stored && INDIAN_LANGUAGES.some((l) => l.code === stored)) {
          setLanguageState(stored as LanguageCode);
        }
      } catch (err) {
        // Fallback to default 'en'
      }
    };
    loadStoredLanguage();
  }, []);

  const setLanguage = useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
    AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang).catch(() => {});
  }, []);

  const cycleLanguage = useCallback(() => {
    setLanguageState((prev) => {
      const idx = INDIAN_LANGUAGES.findIndex((l) => l.code === prev);
      const nextIdx = (idx + 1) % INDIAN_LANGUAGES.length;
      const nextLang = INDIAN_LANGUAGES[nextIdx].code;
      AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, nextLang).catch(() => {});
      return nextLang;
    });
  }, []);

  const t = useCallback(
    (key: TranslationKey, defaultText?: string): string => {
      const langDict = (translations as any)[language] || translations.en;
      if (langDict && key in langDict) {
        return langDict[key];
      }
      // Fallback to Hindi if target language missing this specific key
      if (translations.hi && key in translations.hi && language !== 'en') {
        return translations.hi[key];
      }
      // Fallback to English
      if (translations.en && key in translations.en) {
        return translations.en[key];
      }
      return defaultText || key;
    },
    [language]
  );

  const translateDynamic = useCallback(
    async (text: string): Promise<string> => {
      return TranslationService.translateDynamicText(text, language);
    },
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        languages: INDIAN_LANGUAGES,
        setLanguage,
        cycleLanguage,
        t,
        translateDynamic,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

/**
 * Hook for dynamic real-time Gemini translation of any arbitrary text with caching
 */
export function useAutoTranslate(text: string): string {
  const { language, translateDynamic } = useLanguage();
  const [translated, setTranslated] = useState(text);

  useEffect(() => {
    let isMounted = true;
    if (!text || language === 'en') {
      setTranslated(text);
      return;
    }

    translateDynamic(text).then((res) => {
      if (isMounted && res) {
        setTranslated(res);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [text, language, translateDynamic]);

  return translated;
}

/**
 * Component that automatically translates any text to the active language via Gemini AI
 */
export const AutoTranslateText: React.FC<TextProps & { text: string }> = ({ text, ...props }) => {
  const translated = useAutoTranslate(text);
  return <Text {...props}>{translated}</Text>;
};
