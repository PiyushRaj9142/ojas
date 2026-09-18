export type NotificationType =
  | 'TEMPERATURE'
  | 'HUMIDITY'
  | 'BATTERY'
  | 'SOLAR'
  | 'STORAGE'
  | 'INVENTORY'
  | 'BOOKING'
  | 'SYSTEM'
  | 'SECURITY'
  | 'OTP';

export type NotificationPriority = 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export interface AppNotification {
  id: string;
  userId?: string;
  title: string;
  titleHi?: string;
  message: string;
  messageHi?: string;
  type: NotificationType;
  priority: NotificationPriority;
  isRead: boolean;
  createdAt: string; // ISO 8601 string
  readAt?: string;
  metadata?: Record<string, any>;
  actionUrl?: string;
}

export interface NotificationFilter {
  priority?: NotificationPriority;
  type?: NotificationType;
  unreadOnly?: boolean;
}
