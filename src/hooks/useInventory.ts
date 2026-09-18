import { useState } from 'react';
import { CropItem } from '../types/crop';
import { INITIAL_CROPS } from '../data/mockCrops';

export function useInventory() {
  const [crops, setCrops] = useState<CropItem[]>(INITIAL_CROPS);

  const addCrop = (newCrop: CropItem) => {
    setCrops(prev => [newCrop, ...prev]);
  };

  const removeCrop = (id: string) => {
    setCrops(prev => prev.filter(c => c.id !== id));
  };

  const totalWeightKg = crops.reduce((sum, c) => sum + c.quantity, 0);
  const totalValueInr = crops.reduce((sum, c) => sum + c.estimatedTotalMarketValue, 0);

  return {
    crops,
    addCrop,
    removeCrop,
    totalWeightKg,
    totalValueInr,
  };
}
