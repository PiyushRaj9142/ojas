import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface StorageVisualizationProps {
  temperature: number;
  humidity: number;
  capacityUsedPercentage: number;
  capacityUsedKg: number;
  capacityMaxKg: number;
}

export default function StorageVisualization({
  temperature,
  humidity,
  capacityUsedPercentage,
  capacityUsedKg,
  capacityMaxKg,
}: StorageVisualizationProps) {
  const zones = [
    {
      id: 'z1',
      name: 'Zone A (Upper Shelf)',
      temp: '5.2°C',
      ideal: 'Tomatoes, Brinjals',
      color: '#ef4444',
      crates: 4,
    },
    {
      id: 'z2',
      name: 'Zone B (Middle Shelf)',
      temp: '4.7°C',
      ideal: 'Capsicum, Carrots, Beans',
      color: '#16a34a',
      crates: 5,
    },
    {
      id: 'z3',
      name: 'Zone C (Lower Cold Core)',
      temp: '2.8°C',
      ideal: 'Leafy Greens, Peas, Cauliflower',
      color: '#0284c7',
      crates: 3,
    },
  ];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons name="cube-scan" size={20} color={colors.primary} />
          <Text style={styles.title}>Micro-Climate Chamber Racks</Text>
        </View>
        <View style={styles.capacityBadge}>
          <Text style={styles.capacityText}>{capacityUsedKg} / {capacityMaxKg} kg ({capacityUsedPercentage}%)</Text>
        </View>
      </View>

      {/* Progress Capacity Bar */}
      <View style={styles.capacityBarContainer}>
        <View style={[styles.capacityBarFill, { width: `${capacityUsedPercentage}%` }]} />
      </View>

      {/* 3 Physical Racks Visual */}
      <View style={styles.racksContainer}>
        {zones.map((zone) => (
          <View key={zone.id} style={[styles.rackRow, { borderLeftColor: zone.color }]}>
            <View style={styles.rackHeader}>
              <View style={styles.rackTitleRow}>
                <View style={[styles.rackDot, { backgroundColor: zone.color }]} />
                <Text style={styles.rackName}>{zone.name}</Text>
              </View>
              <Text style={[styles.rackTemp, { color: zone.color }]}>{zone.temp}</Text>
            </View>

            <View style={styles.rackFooter}>
              <Text style={styles.rackIdeal} numberOfLines={1}>Crops: {zone.ideal}</Text>
              <Text style={styles.rackCrates}>{zone.crates} Crates</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  capacityBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  capacityText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  capacityBarContainer: {
    height: 6,
    backgroundColor: colors.backgroundSubtle,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 14,
  },
  capacityBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  racksContainer: {
    gap: 8,
  },
  rackRow: {
    backgroundColor: colors.backgroundSubtle,
    borderRadius: 10,
    padding: 10,
    borderLeftWidth: 3.5,
  },
  rackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  rackTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rackDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  rackName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  rackTemp: {
    fontSize: 13,
    fontWeight: '800',
  },
  rackFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rackIdeal: {
    fontSize: 11,
    color: colors.textMuted,
    flex: 1,
  },
  rackCrates: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
