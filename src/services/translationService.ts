import AsyncStorage from '@react-native-async-storage/async-storage';
import { LanguageCode } from '../types/user';

const CACHE_PREFIX = '@dynamic_trans_cache_v2_';

const LANGUAGE_PROMPT_DESCRIPTIONS: Record<LanguageCode, string> = {
  en: 'clear simple English',
  hi: 'natural Devanagari Hindi (हिन्दी) for Indian farmers',
  mr: 'natural Marathi (मराठी) for Maharashtra farmers',
  bn: 'natural Bengali (বাংলা) for farmers',
  te: 'natural Telugu (తెలుగు) for farmers',
  ta: 'natural Tamil (தமிழ்) for farmers',
  gu: 'natural Gujarati (ગુજરાતી) for farmers',
  kn: 'natural Kannada (ಕನ್ನಡ) for farmers',
  ml: 'natural Malayalam (മലയാളം) for farmers',
  pa: 'natural Punjabi (ਪੰਜਾਬੀ) for farmers',
  or: 'natural Odia (ଓଡ଼ିଆ) for farmers',
  hinglish: 'conversational Hinglish (Roman Hindi + English)',
};

export class TranslationService {
  private static memoryCache: Map<string, string> = new Map();

  private static getCacheKey(text: string, targetLang: LanguageCode): string {
    return `${targetLang}_${text.trim().toLowerCase().slice(0, 120)}`;
  }

  /**
   * Translate arbitrary dynamic text with dual Gemini API (Backend + Direct Google AI Studio fallback) and cache.
   */
  static async translateDynamicText(
    text: string,
    targetLanguage: LanguageCode
  ): Promise<string> {
    if (!text || !text.trim() || targetLanguage === 'en') {
      return text;
    }

    const cacheKey = this.getCacheKey(text, targetLanguage);

    // 1. Check fast in-memory cache
    if (this.memoryCache.has(cacheKey)) {
      return this.memoryCache.get(cacheKey)!;
    }

    // 2. Check AsyncStorage persistent disk cache
    try {
      const diskCached = await AsyncStorage.getItem(CACHE_PREFIX + cacheKey);
      if (diskCached) {
        this.memoryCache.set(cacheKey, diskCached);
        return diskCached;
      }
    } catch {
      // Continue to API call
    }

    // 3. Call Secure Vercel Serverless /api/translate Endpoint
    const baseUrl = (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_BASE_URL) || '';
    const endpoints = [
      '/api/translate',
      baseUrl ? `${baseUrl}/api/translate` : null,
      baseUrl ? `${baseUrl}/api/ai/translate` : null,
    ].filter(Boolean) as string[];

    for (const endpoint of endpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4500);

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            target_language: targetLanguage,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          const json = await res.json();
          const translated = json.translated || json.translated_text || text;
          if (translated && translated !== text) {
            this.memoryCache.set(cacheKey, translated);
            AsyncStorage.setItem(CACHE_PREFIX + cacheKey, translated).catch(() => {});
            return translated;
          }
        }
      } catch {
        // Try next endpoint
        continue;
      }
    }

    return text;
  }
}
