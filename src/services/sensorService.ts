import { SensorTelemetry, SensorHourlyLog } from '../types/sensor';
import { INITIAL_SENSOR_DATA, MOCK_HOURLY_SENSOR_LOGS } from '../data/mockSensors';
import { ApiClient } from './api';

export class SensorService {
  static async getLiveTelemetry(): Promise<SensorTelemetry> {
    return ApiClient.get<SensorTelemetry>('/storage/sensors', INITIAL_SENSOR_DATA);
  }

  static async getHourlyLogs(): Promise<SensorHourlyLog[]> {
    return ApiClient.get<SensorHourlyLog[]>('/storage/sensors/hourly', MOCK_HOURLY_SENSOR_LOGS);
  }
}
