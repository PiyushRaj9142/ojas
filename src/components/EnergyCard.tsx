import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import EnergyFlow from './EnergyFlow';

interface EnergyCardProps {
  windGenerationKw: number;
  batteryLevel: number;
  consumptionKw: number;
  availableKw: number;
  onPressDetails?: () => void;
}

export default function EnergyCard({
  windGenerationKw,
  batteryLevel,
  consumptionKw,
  availableKw,
  onPressDetails,
}: EnergyCardProps) {
  const { theme } = useTheme();
  const isCharging = availableKw >= 0;

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.shadowColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.iconCircle, { backgroundColor: theme.secondaryLight }]}>
            <MaterialCommunityIcons name="lightning-bolt" size={18} color={theme.secondary} />
          </View>
          <View>
            <Text style={[styles.title, { color: theme.textPrimary }]}>Energy System</Text>
            <Text style={[styles.subtitle, { color: theme.textMuted }]}>VAWT Wind & Hybrid Storage</Text>
          </View>
        </View>

        {onPressDetails && (
          <TouchableOpacity 
            style={[styles.detailsBtn, { backgroundColor: theme.secondaryLight }]} 
            onPress={onPressDetails}
            activeOpacity={0.7}
          >
            <Text style={[styles.detailsText, { color: theme.secondary }]}>Manage</Text>
            <Feather name="chevron-right" size={14} color={theme.secondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* 4 Energy Metrics Grid */}
      <View style={[styles.metricsGrid, { backgroundColor: theme.backgroundSubtle }]}>
        <View style={styles.metricItem}>
          <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Wind Gen</Text>
          <Text style={[styles.metricValue, { color: theme.secondary }]}>
            {windGenerationKw.toFixed(1)} <Text style={[styles.metricUnit, { color: theme.textMuted }]}>kW</Text>
          </Text>
        </View>

        <View style={styles.metricItem}>
          <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Battery SOC</Text>
          <Text style={[styles.metricValue, { color: theme.primary }]}>
            {batteryLevel}%
          </Text>
        </View>

        <View style={styles.metricItem}>
          <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Load</Text>
          <Text style={[styles.metricValue, { color: theme.textPrimary }]}>
            {consumptionKw.toFixed(1)} <Text style={[styles.metricUnit, { color: theme.textMuted }]}>kW</Text>
          </Text>
        </View>

        <View style={styles.metricItem}>
          <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Net Power</Text>
          <Text style={[styles.metricValue, { color: isCharging ? theme.success : theme.warning }]}>
            {availableKw > 0 ? `+${availableKw.toFixed(1)}` : availableKw.toFixed(1)} <Text style={[styles.metricUnit, { color: theme.textMuted }]}>kW</Text>
          </Text>
        </View>
      </View>

      {/* Animated Visual Flow */}
      <EnergyFlow
        windGenerationKw={windGenerationKw}
        batteryLevel={batteryLevel}
        consumptionKw={consumptionKw}
        isCharging={isCharging}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  detailsText: {
    fontSize: 11,
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    marginBottom: 14,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  metricUnit: {
    fontSize: 10,
    fontWeight: '600',
  },
});
