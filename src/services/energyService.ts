import { EnergyOverview, EnergyDataPoint } from '../types/energy';
import { INITIAL_ENERGY_DATA, DAILY_ENERGY_POINTS, WEEKLY_ENERGY_POINTS, MONTHLY_ENERGY_POINTS } from '../data/mockEnergy';
import { ApiClient } from './api';

export class EnergyService {
  static async getEnergyOverview(): Promise<EnergyOverview> {
    return ApiClient.get<EnergyOverview>('/storage/energy', INITIAL_ENERGY_DATA);
  }

  static async getEnergyTrends(period: 'daily' | 'weekly' | 'monthly'): Promise<EnergyDataPoint[]> {
    if (period === 'weekly') return ApiClient.get('/storage/energy/weekly', WEEKLY_ENERGY_POINTS);
    if (period === 'monthly') return ApiClient.get('/storage/energy/monthly', MONTHLY_ENERGY_POINTS);
    return ApiClient.get('/storage/energy/daily', DAILY_ENERGY_POINTS);
  }
}
