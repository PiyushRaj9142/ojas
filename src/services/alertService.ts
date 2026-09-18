import { StorageAlert } from '../types/alert';
import { INITIAL_ALERTS } from '../data/mockAlerts';
import { ApiClient } from './api';

export class AlertService {
  static async getAlerts(): Promise<StorageAlert[]> {
    return ApiClient.get<StorageAlert[]>('/storage/alerts', INITIAL_ALERTS);
  }
}
