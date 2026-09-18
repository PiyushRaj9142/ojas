import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface EnergyFlowProps {
  windGenerationKw: number;
  batteryLevel: number;
  consumptionKw: number;
  isCharging: boolean;
}

export default function EnergyFlow({
  windGenerationKw,
  batteryLevel,
  consumptionKw,
  isCharging,
}: EnergyFlowProps) {
  const steps = [
    {
      id: 'wind',
      icon: 'weather-windy',
      title: 'WIND',
      value: `${windGenerationKw.toFixed(1)} kW`,
      color: colors.secondary,
    },
    {
      id: 'energy',
      icon: 'flash',
      title: 'ENERGY',
      value: 'Hybrid',
      color: colors.warning,
    },
    {
      id: 'battery',
      icon: isCharging ? 'battery-charging-80' : 'battery-80',
      title: 'BATTERY',
      value: `${batteryLevel}%`,
      color: colors.primary,
    },
    {
      id: 'cooling',
      icon: 'snowflake',
      title: 'COOLING',
      value: `${consumptionKw.toFixed(1)} kW`,
      color: colors.secondary,
    },
    {
      id: 'storage',
      icon: 'fruit-cherries',
      title: 'CROPS',
      value: 'Safe',
      color: colors.primary,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.flowRow}>
        {steps.map((step, idx) => (
          <React.Fragment key={step.id}>
            <View style={styles.node}>
              <View style={[styles.iconCircle, { borderColor: step.color, backgroundColor: `${step.color}15` }]}>
                <MaterialCommunityIcons name={step.icon as any} size={18} color={step.color} />
              </View>
              <Text style={styles.nodeTitle}>{step.title}</Text>
              <Text style={[styles.nodeValue, { color: step.color }]}>{step.value}</Text>
            </View>

            {idx < steps.length - 1 && (
              <View style={styles.connector}>
                <MaterialCommunityIcons name="arrow-right-thin" size={18} color={colors.textLight} />
              </View>
            )}
          </React.Fragment>
        ))}
      </View>

      <View style={[styles.statusBanner, isCharging ? styles.bannerCharging : styles.bannerDischarging]}>
        <MaterialCommunityIcons 
          name={isCharging ? "battery-charging" : "battery-minus"} 
          size={16} 
          color={isCharging ? colors.success : colors.warning} 
        />
        <Text style={[styles.statusBannerText, { color: isCharging ? colors.success : colors.warning }]}>
          {isCharging 
            ? 'Battery Charging • Renewable Clean Power' 
            : 'Battery Supplying Off-Grid Cooling'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardSubtle,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  flowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  node: {
    alignItems: 'center',
    width: 52,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  nodeTitle: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.3,
  },
  nodeValue: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 1,
  },
  connector: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -16,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  bannerCharging: {
    backgroundColor: colors.successLight,
  },
  bannerDischarging: {
    backgroundColor: colors.warningLight,
  },
  statusBannerText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
