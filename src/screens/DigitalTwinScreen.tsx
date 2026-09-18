import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';
import { SensorTelemetry } from '../types/sensor';
import DigitalTwinView from '../components/DigitalTwinView';

interface DigitalTwinScreenProps {
  telemetry: SensorTelemetry;
}

export default function DigitalTwinScreen({ telemetry }: DigitalTwinScreenProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.headerBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.twinIconBadge, { backgroundColor: theme.primaryLight }]}>
            <MaterialCommunityIcons name="cube-scan" size={24} color={theme.primary} />
          </View>
          <View>
            <Text style={[styles.title, { color: theme.textPrimary }]}>{t('digitalTwinTitle', 'System Digital Twin')}</Text>
            <Text style={[styles.subtitle, { color: theme.textMuted }]}>{t('digitalTwinSub', 'Interactive 2.5D Physical Subsystem Simulation')}</Text>
          </View>
        </View>
      </View>

      {/* Digital Twin 2.5D View */}
      <DigitalTwinView telemetry={telemetry} />

      {/* Architecture Overview Card */}
      <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.infoTitle, { color: theme.textPrimary }]}>{t('aboutDigitalTwin', 'About This Digital Twin')}</Text>
        <Text style={[styles.infoText, { color: theme.textSecondary }]}>
          {t('aboutDigitalTwinDesc', 'The digital twin synchronizes physical farm telemetry every few seconds from the VAWT rotor, LiFePO4 battery BMS, variable compressor, and micro-climate IoT array. Tap any component above to inspect deep engineering telemetry.')}
        </Text>
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
  headerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  twinIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 14,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
