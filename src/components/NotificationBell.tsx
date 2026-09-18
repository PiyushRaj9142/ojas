import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useNotifications } from '../hooks/useNotifications';
import NotificationDropdown from './NotificationDropdown';
import { LanguageCode } from '../types/user';

interface NotificationBellProps {
  language?: LanguageCode;
  onViewAllAlerts?: () => void;
  style?: object;
}

export default function NotificationBell({
  language = 'en',
  onViewAllAlerts,
  style,
}: NotificationBellProps) {
  const { theme } = useTheme();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [buttonLayout, setButtonLayout] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const buttonRef = useRef<View>(null);

  const openDropdown = () => {
    if (buttonRef.current && typeof buttonRef.current.measureInWindow === 'function') {
      buttonRef.current.measureInWindow((x, y, width, height) => {
        setButtonLayout({ x, y, width, height });
        setIsOpen(true);
      });
    } else {
      setIsOpen(true);
    }
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  return (
    <View style={[styles.wrapper, style]} ref={buttonRef} collapsable={false}>
      {/* Top-Left Notification Bell Button */}
      <TouchableOpacity
        style={[
          styles.bellButton,
          {
            backgroundColor: theme.backgroundSubtle,
            borderColor: isOpen ? theme.primary : theme.border,
            shadowColor: theme.shadowColor,
          },
          isOpen && styles.bellButtonActive,
        ]}
        onPress={isOpen ? closeDropdown : openDropdown}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={`Notifications: ${unreadCount} unread. Click to open notifications panel.`}
      >
        <Feather
          name="bell"
          size={16}
          color={unreadCount > 0 ? theme.primary : theme.textPrimary}
        />

        {/* Unread Counter Badge */}
        {unreadCount > 0 && (
          <View
            style={[
              styles.badge,
              {
                backgroundColor: theme.danger,
                borderColor: theme.card,
              },
            ]}
          >
            <Text style={styles.badgeText}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Dropdown Modal Popover */}
      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={closeDropdown}
      >
        <TouchableWithoutFeedback onPress={closeDropdown}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.dropdownWrapper,
                  {
                    ...(buttonLayout
                      ? {
                          top: Math.max(buttonLayout.y + buttonLayout.height + 6, 45),
                          left: Math.max(
                            Platform.OS === 'web' && typeof window !== 'undefined'
                              ? Math.min(buttonLayout.x, window.innerWidth - 335)
                              : buttonLayout.x,
                            10
                          ),
                        }
                      : { top: 56, left: 14 }),
                  },
                ]}
              >
                <NotificationDropdown
                  notifications={notifications}
                  unreadCount={unreadCount}
                  onMarkAsRead={markAsRead}
                  onMarkAllAsRead={markAllAsRead}
                  onDeleteNotification={deleteNotification}
                  onClearAll={clearAll}
                  onClose={closeDropdown}
                  onViewAllAlerts={onViewAllAlerts}
                  language={language}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    zIndex: 60,
  },
  bellButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  bellButtonActive: {
    borderWidth: 1.5,
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 17,
    height: 17,
    borderRadius: 8.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  dropdownWrapper: {
    position: 'absolute',
    zIndex: 9999,
  },
});
