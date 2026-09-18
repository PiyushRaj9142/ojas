import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppNotification, NotificationPriority, NotificationType } from '../types/notification';
import { useTheme } from '../theme/ThemeContext';
import { LanguageCode } from '../types/user';

interface NotificationDropdownProps {
  notifications: AppNotification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
  onClearAll: () => void;
  onClose: () => void;
  onViewAllAlerts?: () => void;
  language?: LanguageCode;
}

export default function NotificationDropdown({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onClearAll,
  onClose,
  onViewAllAlerts,
  language = 'en',
}: NotificationDropdownProps) {
  const { theme, themeMode } = useTheme();
  const [filter, setFilter] = useState<'ALL' | 'ALERTS' | 'INFO'>('ALL');

  const filtered = notifications.filter((n) => {
    if (filter === 'ALERTS') return n.priority === 'HIGH' || n.priority === 'MEDIUM';
    if (filter === 'INFO') return n.priority === 'LOW' || n.priority === 'INFO';
    return true;
  });

  const getRelativeTime = (isoString: string): string => {
    try {
      const now = Date.now();
      const timestamp = new Date(isoString).getTime();
      const diffMs = now - timestamp;
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 60) return language === 'hi' ? 'अभी-अभी' : 'Just now';
      if (diffMins < 60) return language === 'hi' ? `${diffMins} मिनट पहले` : `${diffMins}m ago`;
      if (diffHours < 24) return language === 'hi' ? `${diffHours} घंटे पहले` : `${diffHours}h ago`;
      return language === 'hi' ? `${diffDays} दिन पहले` : `${diffDays}d ago`;
    } catch {
      return 'Recently';
    }
  };

  const getPriorityBadge = (priority: NotificationPriority) => {
    switch (priority) {
      case 'HIGH':
        return { label: 'HIGH', color: theme.danger, bg: theme.dangerLight };
      case 'MEDIUM':
        return { label: 'MED', color: theme.warning, bg: theme.warningLight };
      case 'LOW':
        return { label: 'LOW', color: theme.primary, bg: theme.primaryLight };
      case 'INFO':
      default:
        return { label: 'INFO', color: theme.secondary, bg: theme.secondaryLight };
    }
  };

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'TEMPERATURE':
        return { name: 'thermometer' as const, color: '#ef4444' };
      case 'HUMIDITY':
        return { name: 'water-percent' as const, color: '#0284c7' };
      case 'BATTERY':
        return { name: 'battery-charging-60' as const, color: '#f59e0b' };
      case 'SOLAR':
        return { name: 'weather-windy' as const, color: '#16a34a' };
      case 'SECURITY':
      case 'OTP':
        return { name: 'shield-lock-outline' as const, color: '#8b5cf6' };
      case 'INVENTORY':
      case 'STORAGE':
      default:
        return { name: 'snowflake' as const, color: theme.primary };
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          shadowColor: theme.shadowColor,
        },
      ]}
    >
      {/* 1. Header Bar */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
            {language === 'hi' ? 'सूचनाएं' : 'Notifications'}
          </Text>
          {unreadCount > 0 && (
            <View style={[styles.unreadCountBadge, { backgroundColor: theme.dangerLight }]}>
              <Text style={[styles.unreadCountText, { color: theme.danger }]}>
                {unreadCount} {language === 'hi' ? 'नई' : 'new'}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.markAllBtn}
              onPress={onMarkAllAsRead}
              activeOpacity={0.7}
            >
              <Text style={[styles.markAllText, { color: theme.primaryDark }]}>
                {language === 'hi' ? 'सभी पढ़ें' : 'Mark all read'}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={onClose} style={styles.closeIconBtn}>
            <Feather name="x" size={16} color={theme.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Filter Pills */}
      <View style={[styles.filterBar, { borderBottomColor: theme.borderLight }]}>
        <TouchableOpacity
          style={[
            styles.filterPill,
            filter === 'ALL' && { backgroundColor: theme.primaryLight, borderColor: theme.primary },
          ]}
          onPress={() => setFilter('ALL')}
        >
          <Text
            style={[
              styles.filterPillText,
              { color: filter === 'ALL' ? theme.primaryDark : theme.textMuted },
            ]}
          >
            {language === 'hi' ? 'सभी' : 'All'} ({notifications.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterPill,
            filter === 'ALERTS' && { backgroundColor: theme.dangerLight, borderColor: theme.danger },
          ]}
          onPress={() => setFilter('ALERTS')}
        >
          <Text
            style={[
              styles.filterPillText,
              { color: filter === 'ALERTS' ? theme.danger : theme.textMuted },
            ]}
          >
            🔴 {language === 'hi' ? 'अलर्ट्स' : 'Alerts'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterPill,
            filter === 'INFO' && { backgroundColor: theme.secondaryLight, borderColor: theme.secondary },
          ]}
          onPress={() => setFilter('INFO')}
        >
          <Text
            style={[
              styles.filterPillText,
              { color: filter === 'INFO' ? theme.secondaryDark : theme.textMuted },
            ]}
          >
            ℹ️ {language === 'hi' ? 'सिस्टम' : 'System'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 3. Notification List */}
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="check-circle" size={32} color={theme.primary} />
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
              {language === 'hi' ? 'कोई नया अलर्ट नहीं' : 'All clear!'}
            </Text>
            <Text style={[styles.emptySub, { color: theme.textMuted }]}>
              {language === 'hi'
                ? 'सभी कोल्ड स्टोरेज सेंसर व पैरामीटर्स सामान्य हैं।'
                : 'All sensor subsystems and storage units are running optimally.'}
            </Text>
          </View>
        ) : (
          filtered.map((item) => {
            const priorityBadge = getPriorityBadge(item.priority);
            const typeIcon = getTypeIcon(item.type);
            const title = language === 'hi' && item.titleHi ? item.titleHi : item.title;
            const message = language === 'hi' && item.messageHi ? item.messageHi : item.message;

            return (
              <View
                key={item.id}
                style={[
                  styles.itemCard,
                  {
                    backgroundColor: !item.isRead
                      ? (themeMode === 'DARK' ? '#182742' : theme.backgroundSubtle)
                      : 'transparent',
                    borderBottomColor: theme.borderLight,
                  },
                ]}
              >
                {/* Unread Indicator Dot */}
                {!item.isRead && (
                  <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />
                )}

                {/* Left Type Icon */}
                <View style={[styles.iconCircle, { backgroundColor: theme.backgroundSubtle }]}>
                  <MaterialCommunityIcons name={typeIcon.name} size={18} color={typeIcon.color} />
                </View>

                {/* Content */}
                <View style={styles.itemBody}>
                  <View style={styles.itemHeaderRow}>
                    <View style={[styles.priorityTag, { backgroundColor: priorityBadge.bg }]}>
                      <Text style={[styles.priorityTagText, { color: priorityBadge.color }]}>
                        {priorityBadge.label}
                      </Text>
                    </View>
                    <Text style={[styles.timestamp, { color: theme.textMuted }]}>
                      {getRelativeTime(item.createdAt)}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.itemTitle,
                      {
                        color: theme.textPrimary,
                        fontWeight: !item.isRead ? '800' : '600',
                      },
                    ]}
                  >
                    {title}
                  </Text>
                  <Text style={[styles.itemMessage, { color: theme.textSecondary }]} numberOfLines={2}>
                    {message}
                  </Text>
                </View>

                {/* Action Controls */}
                <View style={styles.itemActions}>
                  {!item.isRead && (
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => onMarkAsRead(item.id)}
                      accessibilityLabel="Mark as read"
                    >
                      <Feather name="check" size={14} color={theme.primary} />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => onDeleteNotification(item.id)}
                    accessibilityLabel="Delete notification"
                  >
                    <Feather name="trash-2" size={13} color={theme.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* 4. Footer */}
      <View style={[styles.footer, { borderTopColor: theme.borderLight }]}>
        {onViewAllAlerts && (
          <TouchableOpacity
            style={styles.viewAllBtn}
            onPress={() => {
              onClose();
              onViewAllAlerts();
            }}
          >
            <Text style={[styles.viewAllText, { color: theme.primaryDark }]}>
              {language === 'hi' ? 'पूरा अलर्ट केंद्र देखें →' : 'View full alert center →'}
            </Text>
          </TouchableOpacity>
        )}
        {notifications.length > 0 && (
          <TouchableOpacity onPress={onClearAll} style={styles.clearAllBtn}>
            <Text style={[styles.clearAllText, { color: theme.textMuted }]}>
              {language === 'hi' ? 'हटाएं' : 'Clear all'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 320,
    maxHeight: 440,
    borderRadius: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  unreadCountBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 10,
  },
  unreadCountText: {
    fontSize: 10,
    fontWeight: '800',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  markAllBtn: {
    paddingVertical: 2,
  },
  markAllText: {
    fontSize: 11,
    fontWeight: '700',
  },
  closeIconBtn: {
    padding: 2,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
    borderBottomWidth: 1,
  },
  filterPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterPillText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  list: {
    maxHeight: 280,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 6,
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 4,
  },
  emptySub: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderBottomWidth: 1,
    position: 'relative',
    gap: 10,
  },
  unreadDot: {
    position: 'absolute',
    left: 4,
    top: 14,
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  itemBody: {
    flex: 1,
  },
  itemHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  priorityTag: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  priorityTagText: {
    fontSize: 8.5,
    fontWeight: '900',
  },
  timestamp: {
    fontSize: 9.5,
    fontWeight: '600',
  },
  itemTitle: {
    fontSize: 11.5,
    marginBottom: 1,
  },
  itemMessage: {
    fontSize: 10.5,
    lineHeight: 14,
  },
  itemActions: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  actionBtn: {
    padding: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  viewAllBtn: {
    paddingVertical: 2,
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: '800',
  },
  clearAllBtn: {
    paddingVertical: 2,
  },
  clearAllText: {
    fontSize: 10.5,
    fontWeight: '600',
  },
});
