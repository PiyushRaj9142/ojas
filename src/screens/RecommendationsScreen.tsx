import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';

export default function RecommendationsScreen() {
  const { theme } = useTheme();
  const { language, t } = useLanguage();

  const recommendations = [
    {
      id: '1',
      priority: 'HIGH' as const,
      icon: 'fruit-cherries',
      title: t('recSellCauliflowerTitle', '🥕 Sell Cauliflower & Carrots Soon'),
      description: t('recSellCauliflowerDesc', 'Cauliflower has 6 days remaining and showing slight moisture loss. Sell within 3-4 days to prevent weight reduction.'),
      impact: t('recSellCauliflowerImpact', '+₹2,400 Profit Protected'),
      color: theme.warning,
    },
    {
      id: '2',
      priority: 'MEDIUM' as const,
      icon: 'package-variant-closed',
      title: t('recStorageCapTitle', '📦 Storage Capacity Available'),
      description: t('recStorageCapDesc', 'Storage capacity is currently 68% (342 kg). You can safely store approximately 158 kg more harvest across Zone A & C.'),
      impact: t('recStorageCapImpact', '158 kg Space Open'),
      color: theme.secondary,
    },
    {
      id: '3',
      priority: 'LOW' as const,
      icon: 'wind-turbine',
      title: t('recWindCleanTitle', '🌬 Peak Clean Energy Window'),
      description: t('recWindCleanDesc', 'Wind velocity expected to remain above 8 m/s for next 18 hours. Ideal window for pre-cooling new incoming harvest.'),
      impact: t('recWindCleanImpact', '100% Free Energy'),
      color: theme.primary,
    },
    {
      id: '4',
      priority: 'LOW' as const,
      icon: 'battery-charging-90',
      title: t('recBatteryAutoTitle', '🔋 Battery Storage Fully Autonomous'),
      description: t('recBatteryAutoDesc', 'Battery state of charge is 84% (48.4V). Sufficient for 18+ hours of uninterrupted cooling in case of wind lulls.'),
      impact: t('recBatteryAutoImpact', 'Zero Grid Risk'),
      color: theme.primary,
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <MaterialCommunityIcons name="lightbulb-on" size={24} color={theme.warning} />
        <View style={styles.headerTextBlock}>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
            {t('smartRecommendations', 'Smart Recommendations')}
          </Text>
          <Text style={[styles.headerSub, { color: theme.textMuted }]}>{t('agroAdvisorySub', 'AI Agronomist & Cold Chain Advisory')}</Text>
        </View>
      </View>

      <View style={styles.list}>
        {recommendations.map((rec) => (
          <View key={rec.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.cardTop}>
              <View style={styles.titleRow}>
                <View style={[styles.iconCircle, { backgroundColor: `${rec.color}15` }]}>
                  <MaterialCommunityIcons name={rec.icon as any} size={20} color={rec.color} />
                </View>
                <Text style={[styles.title, { color: theme.textPrimary }]}>{rec.title}</Text>
              </View>

              <View
                style={[
                  styles.priorityPill,
                  rec.priority === 'HIGH' && { backgroundColor: theme.dangerLight },
                  rec.priority === 'MEDIUM' && { backgroundColor: theme.warningLight },
                  rec.priority === 'LOW' && { backgroundColor: theme.primaryLight },
                ]}
              >
                <Text
                  style={[
                    styles.priorityText,
                    rec.priority === 'HIGH' && { color: theme.danger },
                    rec.priority === 'MEDIUM' && { color: theme.warning },
                    rec.priority === 'LOW' && { color: theme.primaryDark },
                  ]}
                >
                  {rec.priority === 'HIGH' ? t('highPriority', 'HIGH PRIORITY') : rec.priority === 'MEDIUM' ? t('mediumPriority', 'MEDIUM PRIORITY') : t('lowPriority', 'LOW PRIORITY')}
                </Text>
              </View>
            </View>

            <Text style={[styles.desc, { color: theme.textSecondary }]}>{rec.description}</Text>

            <View style={styles.impactRow}>
              <MaterialCommunityIcons name="check-decagram" size={14} color={theme.primary} />
              <Text style={[styles.impactText, { color: theme.primaryDark }]}>{t('benefit', 'Benefit')}: {rec.impact}</Text>
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
    paddingBottom: 120,
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
