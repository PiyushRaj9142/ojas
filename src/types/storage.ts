export type SystemStatus = 'ONLINE' | 'OFFLINE' | 'SYNCING' | 'MAINTENANCE';

export interface StorageZone {
  id: string;
  name: string;
  nameHi: string;
  targetTemp: number;
  currentTemp: number;
  targetHumidity: number;
  currentHumidity: number;
  color: string;
  recommendedCrops: string[];
}

export interface ColdStorageUnit {
  id: string;
  name: string;
  capacityKg: number;
  currentLoadKg: number;
  healthPercentage: number;
  temperature: number;
  humidity: number;
  batteryPercentage: number;
  coolingStatus: 'ACTIVE' | 'IDLE' | 'DEFROST' | 'TURBO';
  status: SystemStatus;
  lastUpdated: string;
  firmwareVersion: string;
  zones: StorageZone[];
}
