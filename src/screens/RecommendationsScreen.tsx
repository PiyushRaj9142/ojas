import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function RecommendationsScreen() {
  const recommendations = [
    {
      id: '1',
      priority: 'HIGH' as const,
      icon: 'fruit-cherries',
      title: '🥕 Sell Cauliflower & Carrots Soon',
      description: 'Cauliflower has 6 days remaining and showing slight moisture loss. Sell within 3-4 days to prevent weight reduction.',
      impact: '+₹2,400 Profit Protected',
      color: colors.warning,
    },
    {
      id: '2',
      priority: 'MEDIUM' as const,
      icon: 'package-variant-closed',
      title: '📦 Storage Capacity Available',
      description: 'Storage capacity is currently 68% (342 kg). You can safely store approximately 158 kg more harvest across Zone A & C.',
      impact: '158 kg Space Open',
      color: colors.secondary,
    },
    {
      id: '3',
      priority: 'LOW' as const,
      icon: 'wind-turbine',
      title: '🌬 Peak Wind Generation Window',
      description: 'Wind velocity expected to remain above 8 m/s for next 18 hours. Ideal window for pre-cooling new incoming harvest.',
      impact: '100% Free Energy',
      color: colors.primary,
    },
    {
      id: '4',
      priority: 'LOW' as const,
      icon: 'battery-charging-90',
      title: '🔋 Battery Storage Fully Autonomous',
      description: 'Battery state of charge is 82% (48.4V). Sufficient for 36+ hours of uninterrupted cooling in case of wind lulls.',
      impact: 'Zero Grid Risk',
      color: colors.primary,
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <MaterialCommunityIcons name="lightbulb-on" size={24} color={colors.warning} />
        <View style={styles.headerTextBlock}>
          <Text style={styles.headerTitle}>Smart Recommendations</Text>
          <Text style={styles.headerSub}>AI Agronomist & Cold Chain Advisory</Text>
        </View>
      </View>

      <View style={styles.list}>
        {recommendations.map((rec) => (
          <View key={rec.id} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.titleRow}>
                <View style={[styles.iconCircle, { backgroundColor: `${rec.color}15` }]}>
                  <MaterialCommunityIcons name={rec.icon as any} size={20} color={rec.color} />
                </View>
                <Text style={styles.title}>{rec.title}</Text>
              </View>

              <View
                style={[
                  styles.priorityPill,
                  rec.priority === 'HIGH' && styles.priorityHigh,
                  rec.priority === 'MEDIUM' && styles.priorityMed,
                  rec.priority === 'LOW' && styles.priorityLow,
                ]}
              >
                <Text
                  style={[
                    styles.priorityText,
                    rec.priority === 'HIGH' && { color: colors.danger },
                    rec.priority === 'MEDIUM' && { color: colors.warning },
                    rec.priority === 'LOW' && { color: colors.primary },
                  ]}
                >
                  {rec.priority} PRIORITY
                </Text>
              </View>
            </View>

            <Text style={styles.desc}>{rec.description}</Text>

            <View style={styles.impactRow}>
              <MaterialCommunityIcons name="check-decagram" size={14} color={colors.primary} />
              <Text style={styles.impactText}>Benefit: {rec.impact}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 90,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  headerTextBlock: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  headerSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    flex: 1,
  },
  priorityPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  priorityHigh: {
    backgroundColor: colors.dangerLight,
  },
  priorityMed: {
    backgroundColor: colors.warningLight,
  },
  priorityLow: {
    backgroundColor: colors.primaryLight,
  },
  priorityText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  desc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  impactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.backgroundSubtle,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  impactText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDark,
  },
});
