import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { SensorHealthStatus } from '../types/sensor';
import { CropStatus } from '../types/crop';

interface StatusBadgeProps {
  status: SensorHealthStatus | CropStatus | 'ONLINE' | 'OFFLINE';
  label?: string;
}

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  let bgColor = colors.successLight;
  let textColor = colors.success;
  let iconText = '✓';
  let defaultLabel = status;

  switch (status) {
    case 'OPTIMAL':
    case 'FRESH':
    case 'ONLINE':
      bgColor = colors.successLight;
      textColor = colors.success;
      iconText = status === 'ONLINE' ? '●' : '✓';
      defaultLabel = status === 'ONLINE' ? 'ONLINE' : 'OPTIMAL';
      break;
    case 'NORMAL':
    case 'GOOD':
      bgColor = colors.infoLight;
      textColor = colors.info;
      iconText = '✓';
      defaultLabel = 'NORMAL';
      break;
    case 'WARNING':
      bgColor = colors.warningLight;
      textColor = colors.warning;
      iconText = '⚠';
      defaultLabel = 'WARNING';
      break;
    case 'CRITICAL':
    case 'OFFLINE':
      bgColor = colors.dangerLight;
      textColor = colors.danger;
      iconText = status === 'OFFLINE' ? '●' : '!';
      defaultLabel = status === 'OFFLINE' ? 'OFFLINE' : 'CRITICAL';
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
