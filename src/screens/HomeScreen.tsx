import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { SensorTelemetry } from '../types/sensor';
import { StorageAlert } from '../types/alert';
import SensorCard from '../components/SensorCard';
import EnergyCard from '../components/EnergyCard';
import { calculateStorageHealth } from '../utils/calculations';
import { LanguageCode } from '../types/user';

import SystemStatusIcon from '../components/SystemStatusIcon';

interface HomeScreenProps {
  telemetry: SensorTelemetry;
  recentAlert?: StorageAlert;
  onNavigate: (screen: string) => void;
  onStartDemo: () => void;
  language?: LanguageCode;
}

export default function HomeScreen({
  telemetry,
  recentAlert,
  onNavigate,
  onStartDemo,
  language = 'en',
}: HomeScreenProps) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 480;

  const healthScore = calculateStorageHealth(
    telemetry.temperature,
    telemetry.humidity,
    telemetry.batteryLevel,
    telemetry.capacityUsedPercentage
  );

  const quickActions = [
    { id: 'storage', label: 'Storage', icon: 'snowflake', color: theme.secondary, screen: 'STORAGE' },
    { id: 'digital-twin', label: 'Digital Twin', icon: 'cube-scan', color: theme.primary, screen: 'DIGITAL_TWIN' },
    { id: 'inventory', label: 'Inventory', icon: 'fruit-cherries', color: '#ea580c', screen: 'INVENTORY' },
    { id: 'energy', label: 'Energy', icon: 'lightning-bolt', color: theme.warning, screen: 'ENERGY' },
    { id: 'analytics', label: 'Analytics', icon: 'chart-bell-curve-cumulative', color: '#8b5cf6', screen: 'ANALYTICS' },
    { id: 'assistant', label: 'AI Assistant', icon: 'robot-happy', color: theme.primary, screen: 'ASSISTANT' },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Storage Overall Health Card */}
      <View
        style={[
          styles.healthCard,
          {
            shadowColor: theme.shadowColor,
            borderRadius: isMobile ? 18 : 22,
          },
        ]}
      >
        <LinearGradient
          colors={theme.gradientGreen}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.healthGradient,
            {
              paddingVertical: isMobile ? 8 : 10,
              paddingHorizontal: isMobile ? 12 : 16,
              minHeight: isMobile ? 76 : 88,
            },
          ]}
        >
          <View style={[styles.healthBannerLeftRow, { marginRight: isMobile ? 8 : 12 }]}>
            <SystemStatusIcon
              telemetry={telemetry}
              healthScore={healthScore}
              language={language}
              size={isMobile ? 36 : 42}
            />
            <View style={styles.healthLeft}>
              <Text
                style={[
                  styles.healthSub,
                  { fontSize: isMobile ? 8.5 : 9.5 },
                ]}
                numberOfLines={1}
              >
                OVERALL SYSTEM STATUS
              </Text>
              <Text
                style={[
                  styles.healthTitle,
                  {
                    fontSize: isMobile ? 15.5 : 17.5,
                    lineHeight: isMobile ? 18.5 : 21,
                  },
                ]}
                numberOfLines={1}
              >
                Storage Health
              </Text>
              <View
                style={[
                  styles.healthTag,
                  {
                    paddingHorizontal: isMobile ? 6 : 7.5,
                    paddingVertical: isMobile ? 1.5 : 2.5,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="shield-check"
                  size={isMobile ? 11 : 12}
                  color="#ffffff"
                />
                <Text
                  style={[
                    styles.healthTagText,
                    { fontSize: isMobile ? 8.5 : 9.5 },
                  ]}
                  numberOfLines={1}
                >
                  All Subsystems Calibrated
                </Text>
              </View>
            </View>
          </View>

          <View
            style={[
              styles.healthScoreCircle,
              {
                width: isMobile ? 58 : 66,
                height: isMobile ? 58 : 66,
                borderRadius: isMobile ? 29 : 33,
              },
            ]}
          >
            <Text
              style={[
                styles.healthScoreText,
                {
                  fontSize: isMobile ? 16 : 18.5,
                  lineHeight: isMobile ? 18 : 20,
                },
              ]}
            >
              {healthScore}%
            </Text>
            <Text
              style={[
                styles.healthScoreSub,
                {
                  fontSize: isMobile ? 8 : 9,
                  lineHeight: isMobile ? 9.5 : 11,
                },
              ]}
            >
              Optimal
            </Text>
          </View>
        </LinearGradient>
      </View>

      {/* 2. Four Sensor Cards Grid (2x2) */}
      <View style={styles.sensorGrid}>
        <View style={styles.gridRow}>
          <SensorCard
            title="TEMPERATURE"
            value={telemetry.temperature.toFixed(1)}
            unit="°C"
            status={telemetry.temperatureStatus}
            statusLabel={telemetry.temperature <= 5.5 ? 'OPTIMAL' : 'WARNING'}
            iconName="thermometer"
            iconColor={theme.secondary}
            onPress={() => onNavigate('STORAGE')}
          />
          <SensorCard
            title="HUMIDITY"
            value={telemetry.humidity}
            unit="%"
            status={telemetry.humidityStatus}
            statusLabel="NORMAL"
            iconName="water-percent"
            iconColor={theme.secondary}
            onPress={() => onNavigate('STORAGE')}
          />
        </View>

        <View style={styles.gridRow}>
          <SensorCard
            title="CAPACITY"
            value={`${telemetry.capacityUsedPercentage}%`}
            unit={`(${telemetry.capacityUsedKg}kg)`}
            status={telemetry.capacityStatus}
            statusLabel={`${telemetry.capacityUsedKg} / ${telemetry.capacityMaxKg} kg`}
            iconName="package-variant-closed"
            iconColor={theme.primary}
            onPress={() => onNavigate('INVENTORY')}
          />
          <SensorCard
            title="BATTERY"
            value={telemetry.batteryLevel}
            unit="%"
            status={telemetry.batteryStatus}
            statusLabel={telemetry.batteryLevel > 50 ? 'HEALTHY' : 'LOW'}
            iconName="battery-charging-90"
            iconColor={theme.primary}
            onPress={() => onNavigate('ENERGY')}
          />
        </View>
      </View>

      {/* 4. Live Energy Card */}
      <EnergyCard
        windGenerationKw={telemetry.windGenerationKw}
        batteryLevel={telemetry.batteryLevel}
        consumptionKw={telemetry.powerConsumptionKw}
        availableKw={telemetry.powerAvailableKw}
        onPressDetails={() => onNavigate('ENERGY')}
      />

      {/* 5. Horizontally Scrollable Quick Action Buttons */}
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Quick Actions</Text>
        <TouchableOpacity onPress={onStartDemo} style={[styles.demoBadgeBtn, { backgroundColor: theme.primaryDark }]}>
          <MaterialCommunityIcons name="presentation-play" size={13} color="#ffffff" />
          <Text style={styles.demoBadgeText}>Judge Demo Mode</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.actionsScroll}
      >
        {quickActions.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.actionChip,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
                shadowColor: theme.shadowColor,
              },
            ]}
            onPress={() => onNavigate(item.screen)}
            activeOpacity={0.75}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: `${item.color}20` }]}>
              <MaterialCommunityIcons name={item.icon as any} size={20} color={item.color} />
            </View>
            <Text style={[styles.actionChipText, { color: theme.textPrimary }]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 6. AI Farmer Recommendation Card */}
      <TouchableOpacity
        style={[
          styles.aiCard,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
            borderLeftColor: theme.primary,
            shadowColor: theme.shadowColor,
          },
        ]}
        onPress={() => onNavigate('ASSISTANT')}
        activeOpacity={0.8}
      >
        <View style={styles.aiCardHeader}>
          <View style={styles.aiBadge}>
            <MaterialCommunityIcons name="creation" size={14} color={theme.primary} />
            <Text style={[styles.aiBadgeText, { color: theme.primary }]}>AI SMART RECOMMENDATION</Text>
          </View>
          <Text style={[styles.aiTapText, { color: theme.secondary }]}>Ask AI →</Text>
        </View>
        <Text style={[styles.aiText, { color: theme.textSecondary }]}>
          "Your storage is operating optimally at 4.8°C. Tomatoes (120 kg) are at peak 92% freshness. Consider selling within 5 days for maximum profit."
        </Text>
      </TouchableOpacity>

      {/* 7. Recent Alert Banner Preview */}
      <TouchableOpacity
        style={[
          styles.alertBanner,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
          },
        ]}
        onPress={() => onNavigate('ALERTS')}
        activeOpacity={0.8}
      >
        <View style={styles.alertLeft}>
          <Feather name="bell" size={16} color={theme.secondary} />
          <View>
            <Text style={[styles.alertTitle, { color: theme.textPrimary }]}>Recent Alert</Text>
            <Text style={[styles.alertDesc, { color: theme.textMuted }]} numberOfLines={1}>
              {recentAlert ? recentAlert.title : 'All systems operating in normal range.'}
            </Text>
          </View>
        </View>
        <Feather name="chevron-right" size={16} color={theme.textMuted} />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 90,
  },
  healthCard: {
    overflow: 'hidden',
    marginBottom: 12,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  healthGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  healthBannerLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  healthLeft: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
  healthSub: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 1,
  },
  healthTitle: {
    color: '#ffffff',
    fontWeight: '900',
    marginBottom: 2.5,
  },
  healthTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3.5,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  healthTagText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  healthScoreCircle: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderWidth: 1.5,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  healthScoreText: {
    color: '#ffffff',
    fontWeight: '900',
  },
  healthScoreSub: {
    color: 'rgba(255, 255, 255, 0.92)',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  sensorGrid: {
    gap: 12,
    marginBottom: 16,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  demoBadgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  demoBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  actionsScroll: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 4,
    marginBottom: 16,
  },
  actionChip: {
    alignItems: 'center',
    borderRadius: 16,
    padding: 12,
    minWidth: 84,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  actionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  actionChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  aiCard: {
    borderRadius: 18,
    padding: 14,
    borderLeftWidth: 4,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 14,
  },
  aiCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  aiBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  aiTapText: {
    fontSize: 11,
    fontWeight: '700',
  },
  aiText: {
    fontSize: 12,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
  },
  alertLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  alertTitle: {
    fontSize: 11,
    fontWeight: '700',
  },
  alertDesc: {
    fontSize: 11,
    marginTop: 1,
  },
});
