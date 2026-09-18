import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import Svg, { Path, Circle, Line, Text as SvgText, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { colors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';
import { MOCK_HOURLY_SENSOR_LOGS } from '../data/mockSensors';

const screenWidth = Dimensions.get('window').width;

export default function AnalyticsScreen() {
  const { theme } = useTheme();
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'TEMP' | 'HUMIDITY' | 'ENERGY' | 'STORAGE' | 'SAVINGS'>('TEMP');

  const chartWidth = screenWidth - 64;
  const chartHeight = 140;
  const paddingX = 18;
  const paddingY = 20;

  const getChartConfig = () => {
    if (activeTab === 'TEMP') {
      const vals = MOCK_HOURLY_SENSOR_LOGS.map(l => l.temp);
      return {
        vals,
        min: 3.5,
        max: 6.5,
        color: theme.secondary,
        unit: '°C',
        title: t('coreTemp24h', 'Core Temperature (Last 24 Hours)'),
        sub: `${t('optimalRange', 'Optimal Range')}: 4.0°C - 5.5°C`,
      };
    }
    if (activeTab === 'HUMIDITY') {
      const vals = MOCK_HOURLY_SENSOR_LOGS.map(l => l.humidity);
      return {
        vals,
        min: 60,
        max: 85,
        color: theme.secondary,
        unit: '%',
        title: t('relHumidity24h', 'Relative Humidity RH (Last 24 Hours)'),
        sub: `${t('optimalRange', 'Optimal Range')}: 70% - 80%`,
      };
    }
    if (activeTab === 'ENERGY') {
      const vals = MOCK_HOURLY_SENSOR_LOGS.map(l => l.generationKw);
      return {
        vals,
        min: 0.5,
        max: 4.0,
        color: theme.primary,
        unit: 'kW',
        title: t('windGenHourly', 'Hourly Clean Wind Generation'),
        sub: 'Peak: 3.1 kW (12:00 PM)',
      };
    }
    const vals = [62, 64, 65, 68, 68];
    return {
      vals,
      min: 50,
      max: 100,
      color: theme.primary,
      unit: '%',
      title: t('storageCapUtil', 'Storage Capacity Utilization'),
      sub: `Current: 342 kg / 500 kg`,
    };
  };

  const config = getChartConfig();

  const points = config.vals.map((val, idx) => {
    const x = paddingX + (idx / (config.vals.length - 1)) * (chartWidth - paddingX * 2);
    const y = chartHeight - paddingY - ((val - config.min) / (config.max - config.min)) * (chartHeight - paddingY * 2);
    const label = MOCK_HOURLY_SENSOR_LOGS[idx]?.time || `D${idx + 1}`;
    return { x, y, val, label };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 5 Analytic Navigation Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
        {[
          { id: 'TEMP' as const, label: t('tempTab', '🌡 Temp') },
          { id: 'HUMIDITY' as const, label: t('humidityTab', '💧 Humidity') },
          { id: 'ENERGY' as const, label: t('energyTab', '⚡ Energy') },
          { id: 'STORAGE' as const, label: t('storageTab', '📦 Storage') },
          { id: 'SAVINGS' as const, label: t('savingsTab', '💰 Savings') },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tabChip,
              { backgroundColor: theme.card, borderColor: theme.border },
              activeTab === tab.id && { backgroundColor: theme.primaryLight, borderColor: theme.primary },
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={[
              styles.tabText,
              { color: theme.textSecondary },
              activeTab === tab.id && { color: theme.primaryDark, fontWeight: '700' },
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Main Analytic SVG Chart */}
      {activeTab !== 'SAVINGS' ? (
        <View style={[styles.chartCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: theme.textPrimary }]}>{config.title}</Text>
            <Text style={[styles.chartSub, { color: theme.textMuted }]}>{config.sub}</Text>
          </View>

          <View style={styles.svgWrapper}>
            <Svg width={chartWidth} height={chartHeight}>
              <Defs>
                <SvgLinearGradient id="analyticsGrad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={config.color} stopOpacity="0.3" />
                  <Stop offset="1" stopColor={config.color} stopOpacity="0.0" />
                </SvgLinearGradient>
              </Defs>

              <Line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke={theme.border} strokeDasharray="4, 4" />
              <Line x1={paddingX} y1={chartHeight / 2} x2={chartWidth - paddingX} y2={chartHeight / 2} stroke={theme.border} strokeDasharray="4, 4" />
              <Line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke={theme.border} />

              <Path d={areaD} fill="url(#analyticsGrad)" />
              <Path d={pathD} fill="none" stroke={config.color} strokeWidth="3" strokeLinecap="round" />

              {points.map((pt, idx) => (
                <React.Fragment key={idx}>
                  <Circle cx={pt.x} cy={pt.y} r={3.5} fill={config.color} stroke="#ffffff" strokeWidth={1.5} />
                  <SvgText x={pt.x} y={chartHeight - 4} fontSize="9" fill={theme.textMuted} textAnchor="middle">
                    {pt.label}
                  </SvgText>
                  <SvgText x={pt.x} y={pt.y - 7} fontSize="8.5" fontWeight="700" fill={theme.textPrimary} textAnchor="middle">
                    {pt.val}{config.unit}
                  </SvgText>
                </React.Fragment>
              ))}
            </Svg>
          </View>
        </View>
      ) : null}

      {/* Comprehensive Farmer Economic Savings Breakdown */}
      <View style={[styles.savingsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.savingsHeader}>
          <MaterialCommunityIcons name="piggy-bank" size={20} color={theme.primary} />
          <Text style={[styles.savingsTitle, { color: theme.textPrimary }]}>{t('farmerEconomicSavings', 'Farmer Economic Savings')}</Text>
        </View>

        <View style={styles.savingsGrid}>
          <View style={[styles.savingRow, { backgroundColor: theme.backgroundSubtle }]}>
            <View style={styles.savingRowLeft}>
              <Text style={[styles.savingRowTitle, { color: theme.textPrimary }]}>{t('cleanElectricitySaved', 'Clean Electricity Saved')}</Text>
              <Text style={[styles.savingRowSub, { color: theme.textMuted }]}>{t('offgridRenewable', '34.8 kWh off-grid renewable energy')}</Text>
            </View>
            <Text style={[styles.savingRowVal, { color: theme.primary }]}>+₹8,850/mo</Text>
          </View>

          <View style={[styles.savingRow, { backgroundColor: theme.backgroundSubtle }]}>
            <View style={styles.savingRowLeft}>
              <Text style={[styles.savingRowTitle, { color: theme.textPrimary }]}>{t('spoilagePrevented', 'Post-Harvest Spoilage Prevented')}</Text>
              <Text style={[styles.savingRowSub, { color: theme.textMuted }]}>{t('spoilageReductionSub', '85% reduction in crop rot & weight loss')}</Text>
            </View>
            <Text style={[styles.savingRowVal, { color: theme.secondary }]}>+₹14,200/mo</Text>
          </View>

          <View style={[styles.savingRow, { backgroundColor: theme.backgroundSubtle }]}>
            <View style={styles.savingRowLeft}>
              <Text style={[styles.savingRowTitle, { color: theme.textPrimary }]}>{t('arbitragePriceGain', 'Arbitrage Market Price Gain')}</Text>
              <Text style={[styles.savingRowSub, { color: theme.textMuted }]}>{t('arbitrageSub', 'Selling at peak prices after 5-7 days cold store')}</Text>
            </View>
            <Text style={[styles.savingRowVal, { color: theme.primary }]}>+₹9,400/mo</Text>
          </View>
        </View>

        <View style={[styles.totalSavingsBox, { backgroundColor: theme.primaryLight }]}>
          <Text style={[styles.totalSavingsLabel, { color: theme.primaryDark }]}>{t('monthlyProfitBoost', 'Estimated Monthly Net Profit Boost')}</Text>
          <Text style={[styles.totalSavingsValue, { color: theme.primaryDark }]}>₹32,450 / {t('daysRemaining', 'Month')}</Text>
        </View>
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
  tabsScroll: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tabChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
  },
  chartCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  chartHeader: {
    marginBottom: 12,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  chartSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  svgWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  savingsCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  savingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  savingsTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  savingsGrid: {
    gap: 12,
    marginBottom: 16,
  },
  savingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.backgroundSubtle,
    padding: 12,
    borderRadius: 12,
  },
  savingRowLeft: {
    flex: 1,
  },
  savingRowTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  savingRowSub: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  savingRowVal: {
    fontSize: 14,
    fontWeight: '800',
  },
  totalSavingsBox: {
    backgroundColor: colors.primaryLight,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  totalSavingsLabel: {
    fontSize: 11,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  totalSavingsValue: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.primaryDark,
    marginTop: 2,
  },
});
