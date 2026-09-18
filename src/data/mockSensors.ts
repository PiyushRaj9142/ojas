import { SensorTelemetry, SensorHourlyLog } from '../types/sensor';

export const INITIAL_SENSOR_DATA: SensorTelemetry = {
  temperature: 4.8,
  temperatureStatus: 'OPTIMAL',
  
  humidity: 72,
  humidityStatus: 'NORMAL',
  
  capacityUsedPercentage: 68,
  capacityUsedKg: 342,
  capacityMaxKg: 500,
  capacityStatus: 'NORMAL',
  
  batteryLevel: 82,
  batteryStatus: 'OPTIMAL',
  batteryVoltage: 48.4,
  batteryTemp: 29.2,
  
  windSpeed: 8.4,
  windGenerationKw: 2.4,
  powerConsumptionKw: 1.6,
  powerAvailableKw: 0.8,
  
  coolingCompressorState: 'ACTIVE',
  ethylenePpm: 0.6,
  timestamp: new Date().toISOString(),
};

export const MOCK_HOURLY_SENSOR_LOGS: SensorHourlyLog[] = [
  { time: '00:00', temp: 4.6, humidity: 74, windSpeed: 7.2, generationKw: 2.1, consumptionKw: 1.5, batteryLevel: 88 },
  { time: '03:00', temp: 4.5, humidity: 75, windSpeed: 8.9, generationKw: 2.6, consumptionKw: 1.4, batteryLevel: 94 },
  { time: '06:00', temp: 4.7, humidity: 73, windSpeed: 6.5, generationKw: 1.8, consumptionKw: 1.5, batteryLevel: 90 },
  { time: '09:00', temp: 5.1, humidity: 71, windSpeed: 9.1, generationKw: 2.7, consumptionKw: 1.8, batteryLevel: 85 },
  { time: '12:00', temp: 5.2, humidity: 70, windSpeed: 10.4, generationKw: 3.1, consumptionKw: 2.1, batteryLevel: 82 },
  { time: '15:00', temp: 5.0, humidity: 71, windSpeed: 9.6, generationKw: 2.8, consumptionKw: 1.9, batteryLevel: 84 },
  { time: '18:00', temp: 4.9, humidity: 72, windSpeed: 8.2, generationKw: 2.3, consumptionKw: 1.7, batteryLevel: 83 },
  { time: '21:00', temp: 4.8, humidity: 73, windSpeed: 7.8, generationKw: 2.2, consumptionKw: 1.6, batteryLevel: 82 },
  { time: 'Now',   temp: 4.8, humidity: 72, windSpeed: 8.4, generationKw: 2.4, consumptionKw: 1.6, batteryLevel: 82 },
];
