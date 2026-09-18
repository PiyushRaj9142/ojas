import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';
import { CropItem } from '../types/crop';
import CropCard from '../components/CropCard';
import AddCropModal from './AddCropModal';
import CropDetailsModal from './CropDetailsModal';

interface InventoryScreenProps {
  crops: CropItem[];
  onAddCrop: (crop: CropItem) => void;
  onRemoveCrop: (id: string) => void;
  totalWeightKg: number;
  totalValueInr: number;
}

export default function InventoryScreen({
  crops,
  onAddCrop,
  onRemoveCrop,
  totalWeightKg,
  totalValueInr,
}: InventoryScreenProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'FRESH' | 'GOOD' | 'WARNING'>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<CropItem | null>(null);

  const filteredCrops = crops.filter(crop => {
    const matchesSearch = crop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          crop.category.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeFilter === 'ALL') return matchesSearch;
    return matchesSearch && crop.status === activeFilter;
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Summary Banner */}
        <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.summaryLeft}>
            <Text style={[styles.summarySub, { color: theme.textMuted }]}>{t('totalStoredWeight', 'TOTAL STORED HARVEST')}</Text>
            <Text style={[styles.summaryWeight, { color: theme.textPrimary }]}>{totalWeightKg} kg</Text>
            <Text style={[styles.summaryCapacity, { color: theme.primary }]}>68% {t('capacityUsedOf', 'of 500 kg Capacity')}</Text>
          </View>

          <View style={styles.summaryRight}>
            <Text style={[styles.summarySub, { color: theme.textMuted }]}>{t('estimatedValue', 'EST. MARKET VALUE')}</Text>
            <Text style={[styles.summaryValue, { color: theme.secondary }]}>₹{totalValueInr.toLocaleString('en-IN')}</Text>
            <Text style={[styles.summaryGain, { color: theme.success }]}>+28% {t('protectedValue', 'Protected Value')}</Text>
          </View>
        </View>

        {/* Search Input Bar */}
        <View style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Feather name="search" size={16} color={theme.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: theme.textPrimary }]}
            placeholder={t('searchCropPlaceholder', 'Search crop, category (e.g. Tomato)...')}
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={16} color={theme.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Status Filter Chips */}
        <View style={styles.filtersRow}>
          {[
            { id: 'ALL' as const, label: t('filterAllCrops', 'All Crops') },
            { id: 'FRESH' as const, label: t('statusFresh', 'Fresh') },
            { id: 'GOOD' as const, label: t('statusGood', 'Good') },
            { id: 'WARNING' as const, label: t('statusWarning', 'Warning') },
          ].map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.filterChip,
                { backgroundColor: theme.card, borderColor: theme.border },
                activeFilter === item.id && { backgroundColor: theme.primaryLight, borderColor: theme.primary },
              ]}
              onPress={() => setActiveFilter(item.id)}
            >
              <Text style={[
                styles.filterText,
                { color: theme.textSecondary },
                activeFilter === item.id && { color: theme.primaryDark, fontWeight: '700' },
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Crops List */}
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          {t('storedBatchesCount', 'Stored Batches')} ({filteredCrops.length})
        </Text>

        <View style={styles.cropsList}>
          {filteredCrops.map((crop) => (
            <CropCard
              key={crop.id}
              crop={crop}
              onPress={(c) => setSelectedCrop(c)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Floating Add Crop Button */}
      <TouchableOpacity
        style={styles.floatingAddBtn}
        onPress={() => setIsAddModalOpen(true)}
        activeOpacity={0.85}
      >
        <Feather name="plus" size={24} color="#ffffff" />
      </TouchableOpacity>

      {/* Add Crop Modal */}
      <AddCropModal
        visible={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddCrop={onAddCrop}
      />

      {/* Crop Details Modal */}
      <CropDetailsModal
        crop={selectedCrop}
        visible={!!selectedCrop}
        onClose={() => setSelectedCrop(null)}
        onDispatchCrop={onRemoveCrop}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 120,
  },
  summaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 16,
  },
  summaryLeft: {
    flex: 1,
  },
  summaryRight: {
    alignItems: 'flex-end',
    flex: 1,
  },
  summarySub: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  summaryWeight: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.primary,
    marginTop: 2,
  },
  summaryCapacity: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 1,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textPrimary,
    marginTop: 2,
  },
  summaryGain: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.secondary,
    marginTop: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  cropsList: {
    gap: 2,
  },
  floatingAddBtn: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
});
