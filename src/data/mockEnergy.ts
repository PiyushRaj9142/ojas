import { EnergyOverview, EnergyDataPoint } from '../types/energy';

export const INITIAL_ENERGY_DATA: EnergyOverview = {
  windGenerationKw: 2.4,
  batteryPercentage: 82,
  consumptionKw: 1.6,
  availableKw: 0.8,
  gridRequired: false,
  batteryFlow: 'CHARGING',
  
  dailyGenerationKwh: 34.8,
  weeklyGenerationKwh: 236.4,
  monthlyGenerationKwh: 980.5,
  
  dailyConsumptionKwh: 24.2,
  weeklyConsumptionKwh: 168.0,
  monthlyConsumptionKwh: 710.2,
  
  co2OffsetKg: 28.5,
  dieselSavedLitres: 11.2,
};

export const DAILY_ENERGY_POINTS: EnergyDataPoint[] = [
  { label: '00h', generation: 2.1, consumption: 1.5, battery: 88 },
  { label: '04h', generation: 2.6, consumption: 1.4, battery: 94 },
  { label: '08h', generation: 2.7, consumption: 1.8, battery: 85 },
  { label: '12h', generation: 3.1, consumption: 2.1, battery: 82 },
  { label: '16h', generation: 2.8, consumption: 1.9, battery: 84 },
  { label: '20h', generation: 2.2, consumption: 1.6, battery: 82 },
];

export const WEEKLY_ENERGY_POINTS: EnergyDataPoint[] = [
  { label: 'Mon', generation: 32, consumption: 24, battery: 85 },
  { label: 'Tue', generation: 36, consumption: 25, battery: 89 },
  { label: 'Wed', generation: 30, consumption: 23, battery: 82 },
  { label: 'Thu', generation: 35, consumption: 24, battery: 87 },
  { label: 'Fri', generation: 38, consumption: 26, battery: 92 },
  { label: 'Sat', generation: 34, consumption: 24, battery: 84 },
  { label: 'Sun', generation: 31, consumption: 22, battery: 82 },
];

export const MONTHLY_ENERGY_POINTS: EnergyDataPoint[] = [
  { label: 'W1', generation: 220, consumption: 160, battery: 86 },
  { label: 'W2', generation: 245, consumption: 175, battery: 88 },
  { label: 'W3', generation: 230, consumption: 165, battery: 84 },
  { label: 'W4', generation: 285, consumption: 210, battery: 82 },
];
