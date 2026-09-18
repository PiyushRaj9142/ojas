import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { LanguageCode } from '../types/user';

import ThemeSwitcher from './ThemeSwitcher';
import NotificationBell from './NotificationBell';

interface HeaderProps {
  storageId?: string;
  isOnline: boolean;
  onToggleOnline?: () => void;
  language: LanguageCode;
  onCycleLanguage?: () => void;
  unreadAlertsCount?: number;
  onPressAlerts?: () => void;
  onPressSettings?: () => void;
}

export default function Header({
  storageId = 'SC-001',
  isOnline,
  onToggleOnline,
  language,
  onCycleLanguage,
  unreadAlertsCount = 0,
  onPressAlerts,
  onPressSettings,
}: HeaderProps) {
  const { theme } = useTheme();

  const getGreeting = () => {
    if (language === 'hi') return 'नमस्ते, किसान भाई 👋';
    if (language === 'hinglish') return 'Good Morning, Kisan Bhai 👋';
    return 'Good Morning, Farmer 👋';
  };

  return (
    <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
      <View style={styles.topRow}>
        <View style={styles.farmerBlock}>
          <View style={styles.brandRow}>
            {/* Top-Left Corner Notification Bell */}
            <NotificationBell
              language={language}
              onViewAllAlerts={onPressAlerts}
            />

            <Image
              source={require('../../assets/icon.png')}
              style={styles.headerLogo}
              resizeMode="cover"
            />
            <View style={styles.farmerTextContainer}>
              <Text style={[styles.greeting, { color: theme.textPrimary }]}>{getGreeting()}</Text>
              <View style={styles.storageMeta}>
                <Text style={[styles.storageId, { color: theme.textMuted }]}>
                  Storage: <Text style={[styles.storageIdHighlight, { color: theme.textPrimary }]}>{storageId}</Text>
                </Text>
                
                <TouchableOpacity 
                  style={[styles.statusPill, isOnline ? { backgroundColor: theme.successLight } : { backgroundColor: theme.dangerLight }]}
                  onPress={onToggleOnline}
                  activeOpacity={0.7}
                >
                  <View style={[styles.statusDot, isOnline ? { backgroundColor: theme.success } : { backgroundColor: theme.danger }]} />
                  <Text style={[styles.statusText, isOnline ? { color: theme.success } : { color: theme.danger }]}>
                    {isOnline ? 'ONLINE' : 'OFFLINE'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.actionsRow}>
          {/* Compact Popover Theme Switcher (LIGHT / MILD / DARK) */}
          <ThemeSwitcher language={language} />

          {/* Language Cycle */}
          {onCycleLanguage && (
            <TouchableOpacity 
              style={[styles.langBtn, { backgroundColor: theme.backgroundSubtle, borderColor: theme.border }]}
              onPress={onCycleLanguage}
              activeOpacity={0.8}
            >
              <Text style={[styles.langText, { color: theme.textPrimary }]}>
                {language === 'en' ? '🌐 EN' : language === 'hi' ? '🇮🇳 हिं' : '🗣️ HING'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Settings Gear */}
          {onPressSettings && (
            <TouchableOpacity 
              style={[styles.iconBtn, { backgroundColor: theme.backgroundSubtle, borderColor: theme.border }]}
              onPress={onPressSettings}
              activeOpacity={0.7}
            >
              <Feather name="settings" size={17} color={theme.textPrimary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  farmerBlock: {
    flex: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerLogo: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  farmerTextContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 15,
    fontWeight: '800',
  },
  storageMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 3,
  },
  storageId: {
    fontSize: 12,
    fontWeight: '500',
  },
  storageIdHighlight: {
    fontWeight: '700',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  themeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  themeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  langBtn: {
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  langText: {
    fontSize: 10,
    fontWeight: '700',
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
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
});
