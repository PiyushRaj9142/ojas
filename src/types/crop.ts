export type CropStatus = 'FRESH' | 'GOOD' | 'WARNING' | 'CRITICAL';

export interface CropItem {
  id: string;
  name: string;
  nameHi: string;
  category: string;
  quantity: number;
  unit: 'kg' | 'crates' | 'quintal';
  freshnessPercentage: number;
  shelfLifeDays: number;
  initialShelfLifeDays: number;
  storageDate: string;
  sellingDate: string;
  status: CropStatus;
  
  optimalTemp: string;
  currentTemp: number;
  currentHumidity: number;
  
  expectedLossPercentage: number;
  estimatedMarketPricePerUnit: number;
  estimatedTotalMarketValue: number;
  recommendedSellingTimeDays: number;
  aiRecommendation: string;
  aiRecommendationHi: string;
  iconEmoji: string;
  color: string;
}
