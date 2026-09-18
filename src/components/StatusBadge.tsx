import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';
import { SensorHealthStatus } from '../types/sensor';
import { CropStatus } from '../types/crop';

interface StatusBadgeProps {
  status: SensorHealthStatus | CropStatus | 'ONLINE' | 'OFFLINE';
  label?: string;
}

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();

  let bgColor = theme.successLight;
  let textColor = theme.success;
  let iconText = '✓';
  let defaultLabel: string = status;

  switch (status) {
    case 'OPTIMAL':
      bgColor = theme.successLight;
      textColor = theme.success;
      iconText = '✓';
      defaultLabel = t('statusOptimal', 'OPTIMAL');
      break;
    case 'FRESH':
      bgColor = theme.successLight;
      textColor = theme.success;
      iconText = '✓';
      defaultLabel = t('statusFresh', 'FRESH');
      break;
    case 'ONLINE':
      bgColor = theme.successLight;
      textColor = theme.success;
      iconText = '●';
      defaultLabel = t('statusOnline', 'ONLINE');
      break;
    case 'NORMAL':
    case 'GOOD':
      bgColor = theme.infoLight;
      textColor = theme.info;
      iconText = '✓';
      defaultLabel = t('statusGood', 'GOOD');
      break;
    case 'WARNING':
      bgColor = theme.warningLight;
      textColor = theme.warning;
      iconText = '⚠';
      defaultLabel = t('statusWarning', 'WARNING');
      break;
    case 'CRITICAL':
      bgColor = theme.dangerLight;
      textColor = theme.danger;
      iconText = '!';
      defaultLabel = t('statusCritical', 'CRITICAL');
      break;
    case 'OFFLINE':
      bgColor = theme.dangerLight;
      textColor = theme.danger;
      iconText = '●';
      defaultLabel = t('statusOffline', 'OFFLINE');
      break;
  }

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }]}>
      <Text style={[styles.icon, { color: textColor }]}>{iconText}</Text>
      <Text style={[styles.text, { color: textColor }]}>{label || defaultLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  icon: {
    fontSize: 10,
    fontWeight: '800',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
