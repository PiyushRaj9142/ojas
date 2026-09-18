import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

export type MainTabType = 'HOME' | 'STORAGE' | 'ANALYTICS' | 'ALERTS' | 'PROFILE';

interface BottomNavProps {
  activeTab: MainTabType;
  onSelectTab: (tab: MainTabType) => void;
  alertsCount?: number;
}

export default function BottomNav({
  activeTab,
  onSelectTab,
  alertsCount = 0,
}: BottomNavProps) {
  const { theme } = useTheme();

  const tabs = [
    {
      id: 'HOME' as MainTabType,
      label: 'HOME',
      icon: (active: boolean) => (
        <Feather name="home" size={20} color={active ? theme.primary : theme.textMuted} />
      ),
    },
    {
      id: 'STORAGE' as MainTabType,
      label: 'STORAGE',
      icon: (active: boolean) => (
        <MaterialCommunityIcons name="snowflake" size={22} color={active ? theme.primary : theme.textMuted} />
      ),
    },
    {
      id: 'ANALYTICS' as MainTabType,
      label: 'ANALYTICS',
      icon: (active: boolean) => (
        <Feather name="bar-chart-2" size={20} color={active ? theme.primary : theme.textMuted} />
      ),
    },
    {
      id: 'ALERTS' as MainTabType,
      label: 'ALERTS',
      hasBadge: alertsCount > 0,
      badgeCount: alertsCount,
      icon: (active: boolean) => (
        <Feather name="bell" size={20} color={active ? theme.primary : theme.textMuted} />
      ),
    },
    {
      id: 'PROFILE' as MainTabType,
      label: 'PROFILE',
      icon: (active: boolean) => (
        <Feather name="user" size={20} color={active ? theme.primary : theme.textMuted} />
      ),
    },
  ];

  return (
    <View style={[styles.navBar, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tabItem}
            onPress={() => onSelectTab(tab.id)}
            activeOpacity={0.7}
          >
            <View style={styles.iconWrapper}>
              {tab.icon(isActive)}
              {tab.hasBadge && (
                <View style={[styles.badge, { backgroundColor: theme.danger, borderColor: theme.card }]}>
                  <Text style={styles.badgeText}>{tab.badgeCount}</Text>
                </View>
              )}
            </View>
            <Text
              style={[
                styles.tabLabel,
                { color: isActive ? theme.primary : theme.textMuted },
                isActive && styles.tabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
            {isActive && <View style={[styles.activeIndicator, { backgroundColor: theme.primary }]} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: 16,
    paddingHorizontal: 8,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    position: 'relative',
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 0.3,
  },
  tabLabelActive: {
    fontWeight: '800',
  },
  activeIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 3,
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -8,
    borderRadius: 8,
    minWidth: 15,
    height: 15,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    borderWidth: 1.5,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '900',
  },
});
