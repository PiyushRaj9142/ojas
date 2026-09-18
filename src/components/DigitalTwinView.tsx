import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { SensorTelemetry } from '../types/sensor';

interface DigitalTwinViewProps {
  telemetry: SensorTelemetry;
}

export default function DigitalTwinView({ telemetry }: DigitalTwinViewProps) {
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [activeLayer, setActiveLayer] = useState<'ALL' | 'ENERGY' | 'THERMAL' | 'CROPS'>('ALL');

  const components = [
    {
      id: 'turbine',
      name: 'Vertical Axis Wind Turbine (VAWT)',
      nameHi: 'वर्टिकल एक्सिस पवन टर्बाइन',
      category: 'ENERGY',
      icon: 'wind-turbine',
      color: colors.secondary,
      summary: `${telemetry.windSpeed} m/s • ${telemetry.windGenerationKw} kW Gen`,
      status: 'OPTIMAL GENERATING',
      details: [
        { label: 'Wind Velocity', value: `${telemetry.windSpeed} m/s` },
        { label: 'Electrical Output', value: `${telemetry.windGenerationKw} kW` },
        { label: 'Rotor RPM', value: `${Math.round(telemetry.windSpeed * 28)} RPM` },
        { label: 'Aerodynamic Efficiency', value: '38.4% (Betz Opt)' },
        { label: 'Cut-in Speed', value: '2.5 m/s' },
        { label: 'Survival Wind Speed', value: '45.0 m/s' },
      ],
      description: 'Quiet, omni-directional Darrieus-Savonius hybrid rotor generates power at low farm wind speeds.',
    },
    {
      id: 'controller',
      name: 'Hybrid MPPT Power Controller',
      nameHi: 'हाइब्रिड पावर कंट्रोलर',
      category: 'ENERGY',
      icon: 'tune-vertical',
      color: colors.warning,
      summary: '98.2% MPPT Efficiency',
      status: 'BALANCED FLOW',
      details: [
        { label: 'Bus Voltage', value: '48.4 V DC' },
        { label: 'Charge Efficiency', value: '98.2%' },
        { label: 'Active Mode', value: 'Wind Direct Cooling' },
        { label: 'Grid Feed', value: 'Off-Grid Standalone' },
      ],
      description: 'Intelligently directs wind turbine power directly to cooling compressor with surplus diverted to battery.',
    },
    {
      id: 'battery',
      name: 'Off-Grid Hybrid Battery Bank',
      nameHi: 'हाइब्रिड बैटरी बैंक',
      category: 'ENERGY',
      icon: 'battery-charging-90',
      color: colors.primary,
      summary: `${telemetry.batteryLevel}% SOC • 48.4V • 36h Reserve`,
      status: 'CHARGING SURPLUS',
      details: [
        { label: 'State of Charge (SOC)', value: `${telemetry.batteryLevel}%` },
        { label: 'Bank Voltage', value: `${telemetry.batteryVoltage} V` },
        { label: 'Cell Temperature', value: `${telemetry.batteryTemp} °C` },
        { label: 'Net Flow', value: telemetry.powerAvailableKw >= 0 ? `+${telemetry.powerAvailableKw} kW` : `${telemetry.powerAvailableKw} kW` },
        { label: 'Autonomous Reserve', value: '36.5 Hours' },
        { label: 'Cycle Health', value: '99.4%' },
      ],
      description: 'Lithium Iron Phosphate (LiFePO4) energy storage ensures unbroken cooling even during wind lulls.',
    },
    {
      id: 'cooling',
      name: 'Variable Speed Refrigeration Unit',
      nameHi: 'वेरिएबल स्पीड कूलिंग यूनिट',
      category: 'THERMAL',
      icon: 'snowflake',
      color: colors.secondary,
      summary: `Active • ${telemetry.powerConsumptionKw} kW • R134a Eco`,
      status: 'ACTIVE COOLING',
      details: [
        { label: 'Compressor State', value: telemetry.coolingCompressorState },
        { label: 'Power Draw', value: `${telemetry.powerConsumptionKw} kW` },
        { label: 'Evaporator Fan', value: '65% PWM Velocity' },
        { label: 'Refrigerant', value: 'R134a Zero-ODP' },
        { label: 'Target Core Temp', value: '4.8 °C' },
      ],
      description: 'High-efficiency brushless DC variable compressor modulates RPM to match available wind generation.',
    },
    {
      id: 'chamber',
      name: 'Cold Storage Thermal Chamber (SC-001)',
      nameHi: 'कोल्ड स्टोरेज मुख्य कक्ष',
      category: 'CROPS',
      icon: 'cube-outline',
      color: colors.primary,
      summary: '500 kg Cap • PUF 100mm Insulated',
      status: 'THERMAL BALANCED',
      details: [
        { label: 'Storage Capacity', value: '500 kg (342 kg Stored)' },
        { label: 'Core Temp', value: `${telemetry.temperature}°C` },
        { label: 'Relative Humidity', value: `${telemetry.humidity}%` },
        { label: 'Insulation', value: '100mm High-Density PUF' },
        { label: 'Door Seals', value: 'Magnetic Multi-Gasket Closed' },
      ],
      description: 'Triple-tier shelving with micro-climate separation preserving horticultural freshness up to 10x longer.',
    },
    {
      id: 'sensors',
      name: 'IoT Environmental Sensor Array',
      nameHi: 'सेंसर व टेलीमेट्री लेयर',
      category: 'THERMAL',
      icon: 'leak',
      color: colors.secondary,
      summary: '6 Nodes Online • Ethylene 0.6 ppm',
      status: 'ALL NODES NORMAL',
      details: [
        { label: 'Ethylene Gas', value: `${telemetry.ethylenePpm} ppm (Safe)` },
        { label: 'Temp Sensor A', value: '5.2 °C (Upper)' },
        { label: 'Temp Sensor B', value: '4.7 °C (Mid)' },
        { label: 'Temp Sensor C', value: '2.8 °C (Lower)' },
        { label: 'Uptime', value: '99.98%' },
      ],
      description: 'Continuously measures temperature, humidity, and ethylene to prevent early spoilage and decay.',
    },
  ];

  const activeComp = components.find(c => c.id === selectedComponent);

  return (
    <View style={styles.container}>
      {/* Interactive Layer Filter Chips */}
      <View style={styles.layerSelector}>
        {(['ALL', 'ENERGY', 'THERMAL', 'CROPS'] as const).map((layer) => (
          <TouchableOpacity
            key={layer}
            style={[styles.layerChip, activeLayer === layer && styles.layerChipActive]}
            onPress={() => setActiveLayer(layer)}
          >
            <Text style={[styles.layerChipText, activeLayer === layer && styles.layerChipTextActive]}>
              {layer === 'ALL' ? '360° System' : `${layer} Layer`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 2.5D Digital Twin Schematic Visual Canvas */}
      <View style={styles.twinCanvas}>
        <View style={styles.canvasHeader}>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>DIGITAL TWIN LIVE TELEMETRY</Text>
          </View>
          <Text style={styles.tapPrompt}>Tap component to inspect</Text>
        </View>

        {/* 2.5D Node Explorer Grid */}
        <View style={styles.twinGrid}>
          {components.map((comp) => {
            const isDimmed = activeLayer !== 'ALL' && comp.category !== activeLayer;
            return (
              <TouchableOpacity
                key={comp.id}
                style={[
                  styles.twinCard,
                  { borderColor: comp.color },
                  isDimmed && styles.twinCardDimmed,
                ]}
                onPress={() => setSelectedComponent(comp.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.compIconCircle, { backgroundColor: `${comp.color}18` }]}>
                  <MaterialCommunityIcons name={comp.icon as any} size={22} color={comp.color} />
                </View>
                <Text style={styles.compCardName} numberOfLines={1}>{comp.name.split('(')[0]}</Text>
                <Text style={[styles.compCardSummary, { color: comp.color }]} numberOfLines={1}>{comp.summary}</Text>
                <View style={styles.statusPill}>
                  <Text style={[styles.statusPillText, { color: comp.color }]}>{comp.status}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Component Inspector Modal / Bottom Sheet */}
      <Modal
        visible={!!selectedComponent}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedComponent(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {activeComp && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalTitleRow}>
                    <View style={[styles.compIconCircle, { backgroundColor: `${activeComp.color}20` }]}>
                      <MaterialCommunityIcons name={activeComp.icon as any} size={22} color={activeComp.color} />
                    </View>
                    <View style={styles.modalTitleBlock}>
                      <Text style={styles.modalCompName}>{activeComp.name}</Text>
                      <Text style={styles.modalCompSub}>{activeComp.nameHi}</Text>
                    </View>
                  </View>

                  <TouchableOpacity onPress={() => setSelectedComponent(null)} style={styles.closeBtn}>
                    <Ionicons name="close" size={22} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                  <Text style={styles.modalDesc}>{activeComp.description}</Text>

                  <Text style={styles.diagnosticsHeader}>Real-Time Diagnostics & Telemetry</Text>
                  <View style={styles.diagGrid}>
                    {activeComp.details.map((item, idx) => (
                      <View key={idx} style={styles.diagItem}>
                        <Text style={styles.diagLabel}>{item.label}</Text>
                        <Text style={styles.diagValue}>{item.value}</Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
  },
  layerSelector: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  layerChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  layerChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  layerChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  layerChipTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  twinCanvas: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  canvasHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  tapPrompt: {
    fontSize: 10,
    color: colors.textMuted,
  },
  twinGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  twinCard: {
    width: '48%',
    backgroundColor: colors.backgroundSubtle,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
  },
  twinCardDimmed: {
    opacity: 0.35,
  },
  compIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  compCardName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  compCardSummary: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  statusPill: {
    marginTop: 6,
    backgroundColor: '#ffffff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusPillText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  modalTitleBlock: {
    flex: 1,
  },
  modalCompName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  modalCompSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 1,
  },
  closeBtn: {
    padding: 4,
  },
  modalBody: {
    marginBottom: 10,
  },
  modalDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
    marginBottom: 14,
  },
  diagnosticsHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  diagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  diagItem: {
    width: '48%',
    backgroundColor: colors.backgroundSubtle,
    borderRadius: 10,
    padding: 10,
  },
  diagLabel: {
    fontSize: 10,
    color: colors.textMuted,
  },
  diagValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
});
