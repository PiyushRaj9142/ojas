import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';
import { CropItem } from '../types/crop';
import StatusBadge from './StatusBadge';

interface CropCardProps {
  crop: CropItem;
  onPress: (crop: CropItem) => void;
}

export default function CropCard({ crop, onPress }: CropCardProps) {
  const { theme } = useTheme();
  const { language, t } = useLanguage();

  const displayName = language !== 'en' && crop.nameHi ? crop.nameHi : crop.name;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={() => onPress(crop)}
      activeOpacity={0.75}
    >
      <View style={styles.topRow}>
        <View style={styles.cropInfoLeft}>
          <View style={[styles.emojiCircle, { backgroundColor: `${crop.color}15` }]}>
            <Text style={styles.emoji}>{crop.iconEmoji}</Text>
          </View>
          <View style={styles.nameBlock}>
            <Text style={[styles.cropName, { color: theme.textPrimary }]} numberOfLines={1}>{displayName}</Text>
            <Text style={[styles.category, { color: theme.textMuted }]}>{crop.category}</Text>
          </View>
        </View>

        <StatusBadge status={crop.status} />
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricCol}>
          <Text style={[styles.metricLabel, { color: theme.textMuted }]}>{t('quantity', 'Quantity')}</Text>
          <Text style={[styles.metricValue, { color: theme.textPrimary }]}>{crop.quantity} {crop.unit}</Text>
        </View>

        <View style={styles.metricCol}>
          <Text style={[styles.metricLabel, { color: theme.textMuted }]}>{t('freshnessScore', 'Freshness')}</Text>
          <Text style={[styles.metricValue, { color: crop.freshnessPercentage >= 80 ? theme.success : theme.warning }]}>
            {crop.freshnessPercentage}%
          </Text>
        </View>

        <View style={styles.metricCol}>
          <Text style={[styles.metricLabel, { color: theme.textMuted }]}>{t('shelfLife', 'Shelf Life')}</Text>
          <Text style={[styles.metricValue, { color: theme.secondary }]}>
            {crop.shelfLifeDays} {t('daysRemaining', 'Days')}
          </Text>
        </View>

        <View style={styles.metricCol}>
          <Text style={[styles.metricLabel, { color: theme.textMuted }]}>{t('estimatedValue', 'Est. Value')}</Text>
          <Text style={[styles.metricValue, { color: theme.textPrimary }]}>
            ₹{crop.estimatedTotalMarketValue}
          </Text>
        </View>
      </View>

      <View style={styles.footerRow}>
        <View style={[styles.tempPill, { backgroundColor: theme.secondaryLight }]}>
          <MaterialCommunityIcons name="snowflake" size={12} color={theme.secondary} />
          <Text style={[styles.tempText, { color: theme.secondary }]}>{crop.currentTemp}°C</Text>
        </View>

        <View style={styles.viewDetailsRow}>
          <Text style={[styles.viewDetailsText, { color: theme.secondary }]}>{t('detailsAndAdvice', 'Details & AI Advice')}</Text>
          <Feather name="arrow-right" size={13} color={theme.secondary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cropInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  emojiCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 22,
  },
  nameBlock: {
    flex: 1,
  },
  cropName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  category: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundSubtle,
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
  },
  metricCol: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 9,
    color: colors.textMuted,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tempPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.secondaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tempText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.secondary,
  },
  viewDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewDetailsText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.secondary,
  },
});
