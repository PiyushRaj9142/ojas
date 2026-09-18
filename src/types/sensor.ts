export type SensorHealthStatus = 'OPTIMAL' | 'NORMAL' | 'WARNING' | 'CRITICAL';

export interface SensorTelemetry {
  temperature: number; // in °C (e.g. 4.8)
  temperatureStatus: SensorHealthStatus;
  
  humidity: number; // in % (e.g. 72)
  humidityStatus: SensorHealthStatus;
  
  capacityUsedPercentage: number; // in % (e.g. 68)
  capacityUsedKg: number; // e.g. 342
  capacityMaxKg: number; // e.g. 500
  capacityStatus: SensorHealthStatus;
  
  batteryLevel: number; // in % (e.g. 82)
  batteryStatus: SensorHealthStatus;
  batteryVoltage: number; // in V (e.g. 48.2)
  batteryTemp: number; // in °C (e.g. 29.4)
  
  windSpeed: number; // in m/s (e.g. 8.4)
  windGenerationKw: number; // in kW (e.g. 2.4)
  powerConsumptionKw: number; // in kW (e.g. 1.6)
  powerAvailableKw: number; // in kW (e.g. 0.8)
  
  coolingCompressorState: 'ACTIVE' | 'IDLE' | 'PULLDOWN' | 'TURBO';
  ethylenePpm: number;
  timestamp: string;
}

export interface SensorHourlyLog {
  time: string;
  temp: number;
  humidity: number;
  windSpeed: number;
  generationKw: number;
  consumptionKw: number;
  batteryLevel: number;
}
