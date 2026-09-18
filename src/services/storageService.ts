import { ColdStorageUnit } from '../types/storage';
import { ApiClient } from './api';

export const INITIAL_STORAGE_UNIT: ColdStorageUnit = {
  id: 'SC-001',
  name: 'Smart Mini Cold Storage (VAWT Hybrid)',
  capacityKg: 500,
  currentLoadKg: 342,
  healthPercentage: 98,
  temperature: 4.8,
  humidity: 72,
  batteryPercentage: 82,
  coolingStatus: 'ACTIVE',
  status: 'ONLINE',
  lastUpdated: new Date().toISOString(),
  firmwareVersion: 'v2.4.1-hybrid',
  zones: [
    {
      id: 'z1',
      name: 'Zone A (Upper Shelf)',
      nameHi: 'ज़ोन A (ऊपरी रैक)',
      targetTemp: 5.5,
      currentTemp: 5.2,
      targetHumidity: 75,
      currentHumidity: 73,
      color: '#ef4444',
      recommendedCrops: ['Tomatoes', 'Brinjals', 'Cucumbers'],
    },
    {
      id: 'z2',
      name: 'Zone B (Middle Shelf)',
      nameHi: 'ज़ोन B (मध्य रैक)',
      targetTemp: 4.5,
      currentTemp: 4.7,
      targetHumidity: 72,
      currentHumidity: 71,
      color: '#16a34a',
      recommendedCrops: ['Capsicum', 'Carrots', 'Beans'],
    },
    {
      id: 'z3',
      name: 'Zone C (Lower Cold Core)',
      nameHi: 'ज़ोन C (निचला कोल्ड कोर)',
      targetTemp: 2.5,
      currentTemp: 2.8,
      targetHumidity: 85,
      currentHumidity: 84,
      color: '#0284c7',
      recommendedCrops: ['Leafy Greens', 'Peas', 'Cauliflower'],
    },
  ],
};

export class StorageService {
  static async getStorageStatus(): Promise<ColdStorageUnit> {
    return ApiClient.get<ColdStorageUnit>('/storage/status', INITIAL_STORAGE_UNIT);
  }
}
