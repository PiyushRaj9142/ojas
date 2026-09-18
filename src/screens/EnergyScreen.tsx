import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import Svg, { Path, Circle, Line, Text as SvgText, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { colors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';
import { SensorTelemetry } from '../types/sensor';
import EnergyFlow from '../components/EnergyFlow';
import { DAILY_ENERGY_POINTS, WEEKLY_ENERGY_POINTS, MONTHLY_ENERGY_POINTS } from '../data/mockEnergy';

const screenWidth = Dimensions.get('window').width;

interface EnergyScreenProps {
  telemetry: SensorTelemetry;
}

export default function EnergyScreen({ telemetry }: EnergyScreenProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [activeMetric, setActiveMetric] = useState<'generation' | 'battery' | 'consumption'>('generation');

  const chartData = period === 'daily' ? DAILY_ENERGY_POINTS : period === 'weekly' ? WEEKLY_ENERGY_POINTS : MONTHLY_ENERGY_POINTS;

  // SVG Chart sizing
  const chartWidth = screenWidth - 64;
  const chartHeight = 140;
  const paddingX = 20;
  const paddingY = 20;

  const values = chartData.map(d => d[activeMetric]);
  const minVal = Math.min(...values) * 0.8;
  const maxVal = Math.max(...values) * 1.2 || 10;

  const points = values.map((val, idx) => {
    const x = paddingX + (idx / (values.length - 1)) * (chartWidth - paddingX * 2);
    const y = chartHeight - paddingY - ((val - minVal) / (maxVal - minVal)) * (chartHeight - paddingY * 2);
    return { x, y, val, label: chartData[idx].label };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`;

  const metricColor = activeMetric === 'generation' ? colors.secondary : activeMetric === 'battery' ? colors.primary : colors.warning;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Main Energy Management Overview Card */}
      <View style={[styles.mainCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.cardSub, { color: theme.textMuted }]}>{t('cleanEnergyFlow', 'HYBRID MICRO-GRID TELEMETRY')}</Text>
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>{t('navEnergy', 'Energy Management')}</Text>
          </View>
          <View style={[styles.gridTag, { backgroundColor: theme.primaryLight }]}>
            <MaterialCommunityIcons name="flash-off" size={14} color={theme.primary} />
            <Text style={[styles.gridTagText, { color: theme.primaryDark }]}>{t('gridIndependence', 'Grid Independence: 100%')}</Text>
          </View>
        </View>

        <View style={styles.overviewGrid}>
          <View style={styles.overviewCol}>
            <Text style={styles.colLabel}>{t('renewablePower', 'Current Gen')}</Text>
            <Text style={[styles.colVal, { color: colors.secondary }]}>
              {telemetry.windGenerationKw.toFixed(1)} <Text style={styles.colUnit}>kW</Text>
            </Text>
          </View>

          <View style={styles.overviewCol}>
            <Text style={styles.colLabel}>{t('batterySoc', 'Battery SOC')}</Text>
            <Text style={[styles.colVal, { color: colors.primary }]}>
              {telemetry.batteryLevel}%
            </Text>
          </View>

          <View style={styles.overviewCol}>
            <Text style={styles.colLabel}>{t('powerConsumption', 'Consumption')}</Text>
            <Text style={[styles.colVal, { color: colors.textPrimary }]}>
              {telemetry.powerConsumptionKw.toFixed(1)} <Text style={styles.colUnit}>kW</Text>
            </Text>
          </View>

          <View style={styles.overviewCol}>
            <Text style={styles.colLabel}>{t('netSurplus', 'Net Available')}</Text>
            <Text style={[styles.colVal, { color: colors.success }]}>
              +{telemetry.powerAvailableKw.toFixed(1)} <Text style={styles.colUnit}>kW</Text>
            </Text>
          </View>
        </View>

        {/* Visual Animated Flow */}
        <EnergyFlow
          windGenerationKw={telemetry.windGenerationKw}
          batteryLevel={telemetry.batteryLevel}
          consumptionKw={telemetry.powerConsumptionKw}
          isCharging={telemetry.powerAvailableKw >= 0}
        />
      </View>

      {/* 2. Interactive SVG Generation & Consumption Charts */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeaderRow}>
          <Text style={styles.chartTitle}>{t('renewableYieldAnalytics', 'Power & Battery Trends')}</Text>

          {/* Time Period Tabs */}
          <View style={styles.periodTabs}>
            {(['daily', 'weekly', 'monthly'] as const).map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.periodTab, period === p && styles.periodTabActive]}
                onPress={() => setPeriod(p)}
              >
                <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
                  {p.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Metric Selector Tabs */}
        <View style={styles.metricTabs}>
          {[
            { id: 'generation' as const, label: t('renewablePower', 'Generation (kW)'), icon: 'weather-windy' },
            { id: 'battery' as const, label: t('batteryReserve', 'Battery (%)'), icon: 'battery-charging' },
            { id: 'consumption' as const, label: t('powerConsumption', 'Demand (kW)'), icon: 'flash' },
          ].map((m) => (
            <TouchableOpacity
              key={m.id}
              style={[styles.metricTab, activeMetric === m.id && styles.metricTabActive]}
              onPress={() => setActiveMetric(m.id)}
            >
              <MaterialCommunityIcons name={m.icon as any} size={14} color={activeMetric === m.id ? colors.primary : colors.textMuted} />
              <Text style={[styles.metricLabel, activeMetric === m.id && styles.metricLabelActive]}>{m.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* SVG Bezier Line Chart */}
        <View style={styles.chartSvgContainer}>
          <Svg width={chartWidth} height={chartHeight}>
            <Defs>
              <SvgLinearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={metricColor} stopOpacity="0.3" />
                <Stop offset="1" stopColor={metricColor} stopOpacity="0.0" />
              </SvgLinearGradient>
            </Defs>

            {/* Background Grid Lines */}
            <Line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke={colors.border} strokeDasharray="3,3" />
            <Line x1={paddingX} y1={chartHeight / 2} x2={chartWidth - paddingX} y2={chartHeight / 2} stroke={colors.border} strokeDasharray="3,3" />
            <Line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke={colors.border} strokeWidth={1} />

            {/* Area Fill */}
            <Path d={areaD} fill="url(#chartGrad)" />

            {/* Line Path */}
            <Path d={pathD} fill="none" stroke={metricColor} strokeWidth={2.5} />

            {/* Data Points */}
            {points.map((pt, idx) => (
              <React.Fragment key={idx}>
                <Circle cx={pt.x} cy={pt.y} r={4} fill={metricColor} stroke="#ffffff" strokeWidth={1.5} />
                <SvgText x={pt.x} y={chartHeight - 4} fontSize="9" fill={colors.textMuted} textAnchor="middle">
                  {pt.label}
                </SvgText>
                <SvgText x={pt.x} y={pt.y - 8} fontSize="9" fontWeight="700" fill={colors.textPrimary} textAnchor="middle">
                  {pt.val}{activeMetric === 'battery' ? '%' : ''}
                </SvgText>
              </React.Fragment>
            ))}
          </Svg>
        </View>
      </View>

      {/* 3. Renewable & Environmental Impact Cards */}
      <View style={styles.impactCard}>
        <Text style={styles.impactTitle}>{t('generationBreakdown', 'Clean Energy & Carbon Offset')}</Text>
        <View style={styles.impactGrid}>
          <View style={styles.impactItem}>
            <MaterialCommunityIcons name="leaf" size={20} color={colors.primary} />
            <Text style={styles.impactVal}>28.5 kg</Text>
            <Text style={styles.impactLabel}>{t('savedProduceKg', 'Daily CO₂ Offset')}</Text>
          </View>

          <View style={styles.impactItem}>
            <MaterialCommunityIcons name="gas-station-off" size={20} color={colors.secondary} />
            <Text style={styles.impactVal}>11.2 L</Text>
            <Text style={styles.impactLabel}>{t('gridIndependence', 'Diesel Saved')}</Text>
          </View>

          <View style={styles.impactItem}>
            <MaterialCommunityIcons name="currency-inr" size={20} color={colors.primary} />
            <Text style={styles.impactVal}>₹295/day</Text>
            <Text style={styles.impactLabel}>{t('farmerProfitGained', 'Electricity Saved')}</Text>
          </View>
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
  mainCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  cardSub: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  gridTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  gridTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  overviewGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundSubtle,
    padding: 12,
    borderRadius: 14,
    marginBottom: 14,
  },
  overviewCol: {
    alignItems: 'center',
  },
  colLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '500',
  },
  colVal: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  colUnit: {
    fontSize: 10,
    color: colors.textMuted,
  },
  chartCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  chartHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  periodTabs: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSubtle,
    borderRadius: 8,
    padding: 2,
  },
  periodTab: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  periodTabActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  periodText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  periodTextActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  metricTabs: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  metricTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.backgroundSubtle,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  metricTabActive: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  metricLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  metricLabelActive: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  chartSvgContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  svgWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  impactCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  impactTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  impactGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  impactItem: {
    alignItems: 'center',
    backgroundColor: colors.backgroundSubtle,
    padding: 12,
    borderRadius: 12,
    width: '31%',
  },
  impactVal: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 4,
  },
  impactLabel: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
});
