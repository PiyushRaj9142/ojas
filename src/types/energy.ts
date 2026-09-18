export type BatteryFlowDirection = 'CHARGING' | 'DISCHARGING' | 'BALANCED';

export interface EnergyOverview {
  windGenerationKw: number;
  batteryPercentage: number;
  consumptionKw: number;
  availableKw: number;
  gridRequired: boolean;
  batteryFlow: BatteryFlowDirection;
  
  dailyGenerationKwh: number;
  weeklyGenerationKwh: number;
  monthlyGenerationKwh: number;
  
  dailyConsumptionKwh: number;
  weeklyConsumptionKwh: number;
  monthlyConsumptionKwh: number;
  
  co2OffsetKg: number;
  dieselSavedLitres: number;
}

export interface EnergyDataPoint {
  label: string;
  generation: number;
  consumption: number;
  battery: number;
}
