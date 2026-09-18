import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE_URL = 'https://api.smartcoldstorage.farm/v1';

export class ApiClient {
  private static async getCached<T>(key: string): Promise<T | null> {
    try {
      const data = await AsyncStorage.getItem(`@cache_${key}`);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private static async setCached<T>(key: string, data: T): Promise<void> {
    try {
      await AsyncStorage.setItem(`@cache_${key}`, JSON.stringify(data));
    } catch {
      // Ignore cache storage error
    }
  }

  static async get<T>(endpoint: string, fallbackData: T): Promise<T> {
    // API-Ready layer: simulates network request with local fallback and offline caching
    try {
      // Simulated 150ms network delay for realistic app responsiveness
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const cached = await this.getCached<T>(endpoint);
      if (cached) {
        return cached;
      }
      
      await this.setCached(endpoint, fallbackData);
      return fallbackData;
    } catch {
      return fallbackData;
    }
  }

  static async post<T>(endpoint: string, payload: any, fallbackResponse: T): Promise<T> {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      return fallbackResponse;
    } catch {
      return fallbackResponse;
    }
  }
}
