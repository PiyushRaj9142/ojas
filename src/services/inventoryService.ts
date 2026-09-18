import { CropItem } from '../types/crop';
import { INITIAL_CROPS } from '../data/mockCrops';
import { ApiClient } from './api';

export class InventoryService {
  static async getCrops(): Promise<CropItem[]> {
    return ApiClient.get<CropItem[]>('/storage/inventory', INITIAL_CROPS);
  }

  static async addCrop(newCrop: CropItem): Promise<CropItem> {
    return ApiClient.post<CropItem>('/inventory', newCrop, newCrop);
  }
}
