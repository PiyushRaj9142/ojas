import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import StatusBadge from './StatusBadge';
import { SensorHealthStatus } from '../types/sensor';

interface SensorCardProps {
  title: string;
  value: string | number;
  unit?: string;
  status: SensorHealthStatus;
  statusLabel?: string;
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor?: string;
  onPress?: () => void;
}

export default function SensorCard({
  title,
  value,
  unit,
  status,
  statusLabel,
  iconName,
  iconColor,
  onPress,
}: SensorCardProps) {
  const { theme } = useTheme();
  const effectiveIconColor = iconColor || theme.primary;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          shadowColor: theme.shadowColor,
        },
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${effectiveIconColor}20` }]}>
          <MaterialCommunityIcons name={iconName} size={20} color={effectiveIconColor} />
        </View>
        <Text style={[styles.title, { color: theme.textSecondary }]} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: theme.textPrimary }]}>{value}</Text>
        {unit && <Text style={[styles.unit, { color: theme.textMuted }]}>{unit}</Text>}
      </View>

      <View style={styles.footer}>
        <StatusBadge status={status} label={statusLabel} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    minHeight: 125,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: '800',
  },
  unit: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
