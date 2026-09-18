import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppNotification, NotificationPriority, NotificationType } from '../types/notification';
import { SensorTelemetry } from '../types/sensor';

const STORAGE_KEY = '@ojas_notifications_store_v1';

// Initial seed notifications representing realistic Smart Cold Storage events
const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Temperature Exceeded Safe Threshold',
    titleHi: 'तापमान सुरक्षित सीमा से अधिक हुआ',
    message: 'Storage Compartment A reached 5.8°C (Safe limit: 0.5°C - 5.5°C). Secondary cooling active.',
    messageHi: 'कम्पार्टमेंट A का तापमान 5.8°C पहुँचा। अतिरिक्त कूलिंग शुरू की गई।',
    type: 'TEMPERATURE',
    priority: 'HIGH',
    isRead: false,
    createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(), // 3 mins ago
    metadata: { temp: 5.8, threshold: 5.5, chamber: 'A' },
  },
  {
    id: 'notif-2',
    title: 'Battery Reserve Below 30%',
    titleHi: 'बैटरी बैकअप 30% से नीचे',
    message: 'LiFePO4 Storage Battery is at 28%. Hybrid solar/wind priority charging initiated.',
    messageHi: 'LiFePO4 बैटरी 28% पर है। हाइब्रिड सौर/पवन चार्जिंग सक्रिय।',
    type: 'BATTERY',
    priority: 'MEDIUM',
    isRead: false,
    createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(), // 18 mins ago
    metadata: { batteryLevel: 28 },
  },
  {
    id: 'notif-3',
    title: 'VAWT Wind Turbine Generation High',
    titleHi: 'पवन चक्की से बिजली उत्पादन तेज',
    message: 'Wind speed 14.2 km/h detected. Generator delivering 4.8 kW clean power to compressor.',
    messageHi: 'हवा की गति 14.2 km/h। 4.8 kW स्वच्छ ऊर्जा कम्प्रेसर को मिल रही है।',
    type: 'SOLAR',
    priority: 'LOW',
    isRead: true,
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 mins ago
    metadata: { windSpeed: 14.2, generationKw: 4.8 },
  },
  {
    id: 'notif-4',
    title: 'Security Authentication Log',
    titleHi: 'सुरक्षा प्रमाणीकरण विवरण',
    message: 'Successful OTP phone login verified from device. Session encrypted.',
    messageHi: 'मोबाइल OTP द्वारा सफल लॉगिन किया गया।',
    type: 'SECURITY',
    priority: 'INFO',
    isRead: true,
    createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(), // 2 hours ago
  },
];

type NotificationListener = (notifications: AppNotification[]) => void;

export class NotificationService {
  private static listeners: Set<NotificationListener> = new Set();
  private static memoryCache: AppNotification[] | null = null;
  private static lastAlertTimestamps: Record<string, number> = {};

  /**
   * Loads all notifications from storage or memory
   */
  static async getNotifications(): Promise<AppNotification[]> {
    if (this.memoryCache) {
      return [...this.memoryCache];
    }
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.memoryCache = JSON.parse(raw);
        return [...this.memoryCache!];
      }
    } catch {
      // Fallback to initial
    }
    this.memoryCache = [...INITIAL_NOTIFICATIONS];
    await this.persist();
    return [...this.memoryCache];
  }

  /**
   * Returns current unread notification count
   */
  static async getUnreadCount(): Promise<number> {
    const list = await this.getNotifications();
    return list.filter((n) => !n.isRead).length;
  }

  /**
   * Adds a new notification and broadcasts to all active subscribers
   */
  static async addNotification(
    data: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'> & { isRead?: boolean }
  ): Promise<AppNotification> {
    const list = await this.getNotifications();
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      isRead: data.isRead ?? false,
      ...data,
    };

    this.memoryCache = [newNotif, ...list];
    await this.persist();
    this.notifySubscribers();
    return newNotif;
  }

  /**
   * Adds a security / auth alert
   */
  static async addSecurityAlert(data: {
    title: string;
    titleHi: string;
    message: string;
    messageHi: string;
    type?: NotificationType;
    priority?: NotificationPriority;
  }): Promise<AppNotification> {
    return this.addNotification({
      title: data.title,
      titleHi: data.titleHi,
      message: data.message,
      messageHi: data.messageHi,
      type: data.type || 'SECURITY',
      priority: data.priority || 'INFO',
    });
  }

  /**
   * Evaluates live IoT sensor telemetry against configured agricultural thresholds
   * Deduplicates repeated triggers within an 8-minute cooldown window
   */
  static async evaluateTelemetry(telemetry: SensorTelemetry): Promise<void> {
    const now = Date.now();
    const COOLDOWN_MS = 8 * 60 * 1000;

    // 1. High Temperature Alert (> 5.5°C)
    if (telemetry.temperature > 5.5) {
      const lastTempAlert = this.lastAlertTimestamps['HIGH_TEMP'] || 0;
      if (now - lastTempAlert > COOLDOWN_MS) {
        this.lastAlertTimestamps['HIGH_TEMP'] = now;
        await this.addNotification({
          title: 'High Temperature Alert',
          titleHi: 'उच्च तापमान चेतावनी',
          message: `Cold storage temperature is ${telemetry.temperature.toFixed(1)}°C (Target: 2.0°C - 5.0°C). Check compressor cooling.`,
          messageHi: `कोल्ड स्टोरेज का तापमान ${telemetry.temperature.toFixed(1)}°C है। कम्प्रेसर कूलिंग चेक करें।`,
          type: 'TEMPERATURE',
          priority: 'HIGH',
          metadata: { temp: telemetry.temperature },
        });
      }
    }

    // 2. Frost / Low Temperature Alert (< 0.5°C)
    if (telemetry.temperature < 0.5) {
      const lastFrostAlert = this.lastAlertTimestamps['LOW_TEMP'] || 0;
      if (now - lastFrostAlert > COOLDOWN_MS) {
        this.lastAlertTimestamps['LOW_TEMP'] = now;
        await this.addNotification({
          title: 'Freezing Warning: Produce at Risk',
          titleHi: 'अत्यधिक ठंड की चेतावनी: उपज जोखिम में',
          message: `Temperature dropped to ${telemetry.temperature.toFixed(1)}°C. Risk of chilling injury for stored vegetables.`,
          messageHi: `तापमान ${telemetry.temperature.toFixed(1)}°C तक गिर गया। सब्जियों को ठंड से नुकसान का जोखिम।`,
          type: 'TEMPERATURE',
          priority: 'HIGH',
          metadata: { temp: telemetry.temperature },
        });
      }
    }

    // 3. Low Battery Alert (< 25%)
    if (telemetry.batteryLevel < 25) {
      const lastBatteryAlert = this.lastAlertTimestamps['LOW_BATTERY'] || 0;
      if (now - lastBatteryAlert > COOLDOWN_MS) {
        this.lastAlertTimestamps['LOW_BATTERY'] = now;
        await this.addNotification({
          title: 'Low Battery Level Alert',
          titleHi: 'कम बैटरी चेतावनी',
          message: `Storage battery is at ${telemetry.batteryLevel}%. Auxiliary grid / solar priority recommended.`,
          messageHi: `बैटरी केवल ${telemetry.batteryLevel}% बची है। सोलर/ग्रिड बैकअप चालू करें।`,
          type: 'BATTERY',
          priority: telemetry.batteryLevel < 15 ? 'HIGH' : 'MEDIUM',
          metadata: { batteryLevel: telemetry.batteryLevel },
        });
      }
    }

    // 4. High Humidity Alert (> 95%)
    if (telemetry.humidity > 95) {
      const lastHumAlert = this.lastAlertTimestamps['HIGH_HUMIDITY'] || 0;
      if (now - lastHumAlert > COOLDOWN_MS) {
        this.lastAlertTimestamps['HIGH_HUMIDITY'] = now;
        await this.addNotification({
          title: 'Excessive Humidity Warning',
          titleHi: 'अत्यधिक नमी चेतावनी',
          message: `Chamber humidity is ${telemetry.humidity}%. Dehumidifier cycling active to prevent microbial rot.`,
          messageHi: `नमी ${telemetry.humidity}% है। सड़न रोकने हेतु डीह्यूमिडिफायर चालू किया गया।`,
          type: 'HUMIDITY',
          priority: 'MEDIUM',
          metadata: { humidity: telemetry.humidity },
        });
      }
    }
  }

  /**
   * Marks a single notification as read
   */
  static async markAsRead(id: string): Promise<void> {
    const list = await this.getNotifications();
    this.memoryCache = list.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n));
    await this.persist();
    this.notifySubscribers();
  }

  /**
   * Marks all notifications as read
   */
  static async markAllAsRead(): Promise<void> {
    const list = await this.getNotifications();
    this.memoryCache = list.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }));
    await this.persist();
    this.notifySubscribers();
  }

  /**
   * Deletes a notification
   */
  static async deleteNotification(id: string): Promise<void> {
    const list = await this.getNotifications();
    this.memoryCache = list.filter((n) => n.id !== id);
    await this.persist();
    this.notifySubscribers();
  }

  /**
   * Clears all notifications
   */
  static async clearAll(): Promise<void> {
    this.memoryCache = [];
    await this.persist();
    this.notifySubscribers();
  }

  /**
   * Subscribes a React component to live notification changes
   */
  static subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener);
    if (this.memoryCache) {
      listener([...this.memoryCache]);
    } else {
      this.getNotifications().then((list) => listener(list));
    }
    return () => {
      this.listeners.delete(listener);
    };
  }

  private static notifySubscribers() {
    const current = this.memoryCache ? [...this.memoryCache] : [];
    this.listeners.forEach((listener) => {
      try {
        listener(current);
      } catch (err) {
        // Safe catch
      }
    });
  }

  private static async persist(): Promise<void> {
    if (this.memoryCache) {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.memoryCache));
      } catch {}
    }
  }
}
