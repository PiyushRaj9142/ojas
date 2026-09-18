export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export interface StorageAlert {
  id: string;
  type: 'TEMPERATURE' | 'BATTERY' | 'HUMIDITY' | 'CROP_EXPIRY' | 'WIND' | 'SYSTEM';
  title: string;
  titleHi: string;
  description: string;
  descriptionHi: string;
  timestamp: string;
  severity: AlertSeverity;
  read: boolean;
  actionRequired?: string;
}
