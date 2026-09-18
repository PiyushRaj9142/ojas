import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';
import { CropItem } from '../types/crop';
import StatusBadge from '../components/StatusBadge';

interface CropDetailsModalProps {
  crop: CropItem | null;
  visible: boolean;
  onClose: () => void;
  onDispatchCrop: (cropId: string) => void;
}

export default function CropDetailsModal({
  crop,
  visible,
  onClose,
  onDispatchCrop,
}: CropDetailsModalProps) {
  const { theme } = useTheme();
  const { language, t } = useLanguage();
  if (!crop) return null;

  const handleDispatch = () => {
    Alert.alert(
      'Dispatch Harvest',
      `Dispatch ${crop.quantity} ${crop.unit} of ${crop.name} for market sale?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Dispatch',
          style: 'destructive',
          onPress: () => {
            onDispatchCrop(crop.id);
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.sheetCard}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <View style={styles.headerLeft}>
              <View style={[styles.emojiCircle, { backgroundColor: `${crop.color}15` }]}>
                <Text style={styles.emoji}>{crop.iconEmoji}</Text>
              </View>
              <View>
                <Text style={[styles.title, { color: theme.textPrimary }]}>{language !== 'en' && crop.nameHi ? crop.nameHi : crop.name}</Text>
                <Text style={[styles.category, { color: theme.textMuted }]}>{crop.category}</Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Status & Freshness Header Banner */}
            <View style={styles.statusRow}>
              <StatusBadge status={crop.status} />
              <Text style={[styles.dateLabel, { color: theme.textMuted }]}>{crop.storageDate}</Text>
            </View>

            {/* Freshness Bar */}
            <View style={[styles.freshnessBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.freshnessHeader}>
                <Text style={[styles.freshnessTitle, { color: theme.textPrimary }]}>{t('freshnessIndex', 'Freshness Index')}</Text>
                <Text style={[styles.freshnessScore, { color: crop.freshnessPercentage >= 80 ? theme.success : theme.warning }]}>
                  {crop.freshnessPercentage}%
                </Text>
              </View>
              <View style={[styles.progressBg, { backgroundColor: theme.backgroundSubtle }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${crop.freshnessPercentage}%`,
                      backgroundColor: crop.freshnessPercentage >= 80 ? theme.success : theme.warning,
                    },
                  ]}
                />
              </View>
            </View>

            {/* 6 Key Crop Health Diagnostic Tiles */}
            <View style={styles.grid}>
              <View style={[styles.tile, { backgroundColor: theme.backgroundSubtle, borderColor: theme.border }]}>
                <Text style={[styles.tileLabel, { color: theme.textMuted }]}>{t('quantity', 'Quantity Stored')}</Text>
                <Text style={[styles.tileValue, { color: theme.textPrimary }]}>{crop.quantity} {crop.unit}</Text>
              </View>

              <View style={[styles.tile, { backgroundColor: theme.backgroundSubtle, borderColor: theme.border }]}>
                <Text style={[styles.tileLabel, { color: theme.textMuted }]}>{t('shelfLife', 'Est. Shelf Life')}</Text>
                <Text style={[styles.tileValue, { color: theme.secondary }]}>{crop.shelfLifeDays} {t('daysRemaining', 'Days')}</Text>
              </View>

              <View style={[styles.tile, { backgroundColor: theme.backgroundSubtle, borderColor: theme.border }]}>
                <Text style={[styles.tileLabel, { color: theme.textMuted }]}>{t('storageTemp', 'Storage Temp')}</Text>
                <Text style={[styles.tileValue, { color: theme.textPrimary }]}>{crop.currentTemp}°C</Text>
              </View>

              <View style={[styles.tile, { backgroundColor: theme.backgroundSubtle, borderColor: theme.border }]}>
                <Text style={[styles.tileLabel, { color: theme.textMuted }]}>{t('relHumidity', 'Relative Humidity')}</Text>
                <Text style={[styles.tileValue, { color: theme.textPrimary }]}>{crop.currentHumidity}%</Text>
              </View>

              <View style={[styles.tile, { backgroundColor: theme.backgroundSubtle, borderColor: theme.border }]}>
                <Text style={[styles.tileLabel, { color: theme.textMuted }]}>{t('expectedLoss', 'Expected Loss')}</Text>
                <Text style={[styles.tileValue, { color: theme.primary }]}>{crop.expectedLossPercentage}% ({t('lowLoss', 'Low')})</Text>
              </View>

              <View style={[styles.tile, { backgroundColor: theme.backgroundSubtle, borderColor: theme.border }]}>
                <Text style={[styles.tileLabel, { color: theme.textMuted }]}>{t('estimatedValue', 'Est. Market Value')}</Text>
                <Text style={[styles.tileValue, { color: theme.textPrimary }]}>₹{crop.estimatedTotalMarketValue}</Text>
              </View>
            </View>

            {/* AI Recommendation Message Card */}
            <View style={[styles.aiBox, { backgroundColor: theme.primaryLight, borderColor: theme.primary }]}>
              <View style={styles.aiHeader}>
                <MaterialCommunityIcons name="robot" size={16} color={theme.primary} />
                <Text style={[styles.aiTitle, { color: theme.primaryDark }]}>{t('aiAgroSellingRec', 'AI Agronomist Selling Recommendation')}</Text>
              </View>
              <Text style={[styles.aiDesc, { color: theme.textPrimary }]}>
                {language !== 'en' && crop.aiRecommendationHi ? crop.aiRecommendationHi : crop.aiRecommendation}
              </Text>
            </View>

            {/* Dispatch Button */}
            <TouchableOpacity style={[styles.dispatchBtn, { backgroundColor: theme.primary }]} onPress={handleDispatch} activeOpacity={0.85}>
              <MaterialCommunityIcons name="truck-delivery" size={18} color="#ffffff" />
              <Text style={styles.dispatchText}>{t('dispatchForSale', 'Dispatch Harvest for Sale')}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetCard: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emojiCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 24,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  category: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 1,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    marginBottom: 10,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  freshnessBox: {
    backgroundColor: colors.backgroundSubtle,
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  freshnessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  freshnessTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  freshnessScore: {
    fontSize: 13,
    fontWeight: '800',
  },
  progressBg: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  tile: {
    width: '48%',
    backgroundColor: colors.backgroundSubtle,
    borderRadius: 12,
    padding: 12,
  },
  tileLabel: {
    fontSize: 10,
    color: colors.textMuted,
  },
  tileValue: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2,
  },
  aiBox: {
    backgroundColor: colors.primaryLight,
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
    borderLeftWidth: 3.5,
    borderLeftColor: colors.primary,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  aiTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  aiDesc: {
    fontSize: 12,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  dispatchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.secondary,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 16,
  },
  dispatchText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
});
