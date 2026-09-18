import { CropStatus } from '../types/crop';

export function calculateCropStatus(freshness: number, shelfLifeDays: number): CropStatus {
  if (freshness >= 85 && shelfLifeDays > 6) return 'FRESH';
  if (freshness >= 70 && shelfLifeDays >= 3) return 'GOOD';
  if (freshness >= 50 && shelfLifeDays >= 1) return 'WARNING';
  return 'CRITICAL';
}

export function calculateEnergySavings(dailyKwh: number, tariffPerKwh: number = 8.5): {
  dailySavedInr: number;
  monthlySavedInr: number;
  annualSavedInr: number;
  co2OffsetKg: number;
} {
  const dailySavedInr = dailyKwh * tariffPerKwh;
  const monthlySavedInr = dailySavedInr * 30;
  const annualSavedInr = dailySavedInr * 365;
  const co2OffsetKg = dailyKwh * 0.82; // standard grid emission factor
  
  return {
    dailySavedInr,
    monthlySavedInr,
    annualSavedInr,
    co2OffsetKg,
  };
}

export function calculateStorageHealth(temp: number, humidity: number, battery: number, loadPercentage: number): number {
  let score = 100;
  
  // Temp optimal is 3.5 - 6.0 °C
  if (temp < 2.0 || temp > 8.0) score -= 25;
  else if (temp < 3.0 || temp > 6.5) score -= 10;
  
  // Humidity optimal is 68 - 85 %
  if (humidity < 60 || humidity > 95) score -= 15;
  
  // Battery healthy is > 50 %
  if (battery < 20) score -= 30;
  else if (battery < 50) score -= 10;
  
  // Capacity overload check
  if (loadPercentage > 95) score -= 10;
  
  return Math.max(10, Math.min(100, score));
}
