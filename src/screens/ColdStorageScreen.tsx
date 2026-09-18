import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';
import { SensorTelemetry } from '../types/sensor';
import StorageVisualization from '../components/StorageVisualization';
import StatusBadge from '../components/StatusBadge';

interface ColdStorageScreenProps {
  telemetry: SensorTelemetry;
  onTriggerTurbo?: () => void;
  language?: string;
}

export default function ColdStorageScreen({
  telemetry,
  onTriggerTurbo,
  language: propLanguage,
}: ColdStorageScreenProps) {
  const { theme } = useTheme();
  const { language: ctxLanguage, t } = useLanguage();
  const language = propLanguage || ctxLanguage;

  const [targetTemp, setTargetTemp] = useState(4.5);
  const [ventMode, setVentMode] = useState<'ECO' | 'NORMAL' | 'BOOST'>('NORMAL');

  const handleTurboBoost = () => {
    setTargetTemp(2.8);
    setVentMode('BOOST');
    if (onTriggerTurbo) onTriggerTurbo();
    Alert.alert('Turbo Pulldown Active', 'Target chamber set to 2.8°C with maximum fan velocity.');
  };

  const sections = [
    {
      id: 'env',
      title: t('envMonitoring', '1. Environment Monitoring'),
      icon: 'weather-dust',
      items: [
        { label: t('coreTemp', 'Core Chamber Temp'), value: `${telemetry.temperature.toFixed(1)}°C`, status: 'OPTIMAL' as const },
        { label: t('relHumidity', 'Relative Humidity'), value: `${telemetry.humidity}%`, status: 'NORMAL' as const },
        { label: t('ethyleneLevel', 'Ethylene Gas (C₂H₄)'), value: `${telemetry.ethylenePpm} ppm`, status: 'OPTIMAL' as const },
        { label: t('ambientTemp', 'Ambient Temperature'), value: '31.4°C', status: 'NORMAL' as const },
      ],
    },
    {
      id: 'cooling',
      title: t('coolingSubsystem', '2. Cooling & Compressor Subsystem'),
      icon: 'snowflake',
      items: [
        { label: t('coolingStatus', 'Compressor State'), value: telemetry.coolingCompressorState, status: 'OPTIMAL' as const },
        { label: t('powerConsumption', 'Refrigeration Load'), value: `${telemetry.powerConsumptionKw} kW`, status: 'NORMAL' as const },
        { label: t('airflowRate', 'Evaporator Fan Speed'), value: ventMode === 'BOOST' ? '100% (High)' : '65% (Normal)', status: 'OPTIMAL' as const },
        { label: t('defrostCycle', 'Defrost Cycle'), value: 'Auto (6h)', status: 'NORMAL' as const },
      ],
    },
    {
      id: 'energy',
      title: t('cleanEnergyLink', '3. Hybrid Clean Energy Link'),
      icon: 'wind-turbine',
      items: [
        { label: t('windGeneration', 'Wind Power Generation'), value: `${telemetry.windGenerationKw} kW`, status: 'OPTIMAL' as const },
        { label: t('batterySoc', 'Battery Reserve (SOC)'), value: `${telemetry.batteryLevel}%`, status: 'OPTIMAL' as const },
        { label: t('gridIndependence', 'Grid Dependency'), value: '0% (100% Off-Grid)', status: 'OPTIMAL' as const },
        { label: t('autonomousBackup', 'Autonomous Backup'), value: '36.5 Hours', status: 'OPTIMAL' as const },
      ],
    },
    {
      id: 'health',
      title: t('systemHealthSec', '4. System Structural Health'),
      icon: 'shield-check',
      items: [
        { label: t('insulation', 'Insulation Integrity'), value: '100mm PUF (Optimal)', status: 'OPTIMAL' as const },
        { label: t('doorSeal', 'Door Seal Gasket'), value: 'Closed & Sealed', status: 'OPTIMAL' as const },
        { label: t('sensorMeshOnline', 'IoT Sensor Mesh'), value: '6/6 Online (99.9%)', status: 'OPTIMAL' as const },
        { label: t('systemSafe', 'Firmware Version'), value: 'v2.4.1 Hybrid Off-Grid', status: 'NORMAL' as const },
      ],
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Title & Setpoint Control Card */}
      <View style={styles.setpointCard}>
        <View style={styles.setpointHeader}>
          <View>
            <Text style={styles.setpointSub}>{t('appName', 'COLD STORAGE CONTROLLER')}</Text>
            <Text style={styles.setpointTitle}>{t('chamberSetpoint', 'Chamber Setpoint')}</Text>
          </View>
          <View style={styles.currentTempBadge}>
            <Text style={styles.currentTempLabel}>{t('liveTemp', 'Live:')}</Text>
            <Text style={styles.currentTempValue}>{telemetry.temperature.toFixed(1)}°C</Text>
          </View>
        </View>

        <View style={styles.targetAdjusterRow}>
          <View>
            <Text style={styles.targetLabel}>{t('targetTemp', 'Target Temperature')}</Text>
            <Text style={styles.targetValue}>{targetTemp.toFixed(1)}°C</Text>
          </View>

          <View style={styles.stepper}>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => setTargetTemp(prev => Math.max(1.5, +(prev - 0.5).toFixed(1)))}
            >
              <Feather name="minus" size={18} color={colors.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.stepBtn, styles.stepBtnPlus]}
              onPress={() => setTargetTemp(prev => Math.min(12.0, +(prev + 0.5).toFixed(1)))}
            >
              <Feather name="plus" size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Turbo Pulldown Boost Button */}
        <TouchableOpacity
          style={styles.turboBtn}
          onPress={handleTurboBoost}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="rocket-launch" size={16} color="#ffffff" />
          <Text style={styles.turboBtnText}>{t('turboBoost', 'Trigger Turbo Cooling Pulldown (2.8°C)')}</Text>
        </TouchableOpacity>
      </View>

      {/* Interactive Micro-Climate 3-Rack Storage Visualization */}
      <StorageVisualization
        temperature={telemetry.temperature}
        humidity={telemetry.humidity}
        capacityUsedPercentage={telemetry.capacityUsedPercentage}
        capacityUsedKg={telemetry.capacityUsedKg}
        capacityMaxKg={telemetry.capacityMaxKg}
      />

      {/* 4 Detailed Subsystem Monitoring Sections */}
      {sections.map((sec) => (
        <View key={sec.id} style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <MaterialCommunityIcons name={sec.icon as any} size={18} color={colors.primary} />
              <Text style={styles.sectionCardTitle}>{sec.title}</Text>
            </View>
          </View>

          <View style={styles.sectionItemsList}>
            {sec.items.map((item, idx) => (
              <View key={idx} style={styles.itemRow}>
                <Text style={styles.itemLabel}>{item.label}</Text>
                <View style={styles.itemRight}>
                  <Text style={styles.itemValue}>{item.value}</Text>
                  <StatusBadge status={item.status} />
                </View>
              </View>
            ))}
          </View>
        </View>
      ))}
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
  setpointCard: {
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
  setpointHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  setpointSub: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  setpointTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  currentTempBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.secondaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  currentTempLabel: {
    fontSize: 11,
    color: colors.secondary,
    fontWeight: '600',
  },
  currentTempValue: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.secondary,
  },
  targetAdjusterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundSubtle,
    padding: 12,
    borderRadius: 14,
    marginBottom: 12,
  },
  targetLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  targetValue: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textPrimary,
    marginTop: 2,
  },
  stepper: {
    flexDirection: 'row',
    gap: 8,
  },
  stepBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnPlus: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  turboBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.secondary,
    paddingVertical: 12,
    borderRadius: 12,
  },
  turboBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  sectionHeader: {
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sectionItemsList: {
    gap: 10,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
