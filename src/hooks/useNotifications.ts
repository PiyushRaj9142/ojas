import { useState, useEffect, useCallback } from 'react';
import { AppNotification, NotificationPriority } from '../types/notification';
import { NotificationService } from '../services/notificationService';

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch and subscription to live updates
    const unsubscribe = NotificationService.subscribe((list) => {
      setNotifications(list);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = useCallback(async (id: string) => {
    await NotificationService.markAsRead(id);
  }, []);

  const markAllAsRead = useCallback(async () => {
    await NotificationService.markAllAsRead();
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    await NotificationService.deleteNotification(id);
  }, []);

  const clearAll = useCallback(async () => {
    await NotificationService.clearAll();
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  };
}
