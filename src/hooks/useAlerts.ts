import { useState } from 'react';
import { StorageAlert } from '../types/alert';
import { INITIAL_ALERTS } from '../data/mockAlerts';

export function useAlerts() {
  const [alerts, setAlerts] = useState<StorageAlert[]>(INITIAL_ALERTS);

  const markAllAsRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  };

  const clearAllAlerts = () => {
    setAlerts([]);
  };

  const addAlert = (alert: StorageAlert) => {
    setAlerts(prev => [alert, ...prev]);
  };

  const unreadCount = alerts.filter(a => !a.read).length;

  return {
    alerts,
    unreadCount,
    markAllAsRead,
    clearAllAlerts,
    addAlert,
  };
}
