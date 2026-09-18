import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  Animated,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { SensorTelemetry } from '../types/sensor';
import { useTheme } from '../theme/ThemeContext';
import { LanguageCode } from '../types/user';

interface SystemStatusIconProps {
  telemetry: SensorTelemetry;
  healthScore: number;
  language?: LanguageCode;
  size?: number;
}

export default function SystemStatusIcon({
  telemetry,
  healthScore,
  language = 'en',
  size = 38,
}: SystemStatusIconProps) {
  const { theme, themeMode } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  // Gentle breathing loop animation for healthy state
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const isHealthy = healthScore >= 85 && telemetry.temperature <= 5.5 && telemetry.batteryLevel >= 25;
  const isWarning = !isHealthy && (healthScore >= 70 || telemetry.temperature <= 7.0);

  useEffect(() => {
    let animation: Animated.CompositeAnimation;

    if (isHealthy) {
      // Gentle 2.5s breathing loop
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.06,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 1300,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
    } else if (isWarning) {
      // Subtle alert pulse
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.09,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 900,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
    } else {
      // Critical attention pulse
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.12,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
    }

    return () => {
      if (animation) animation.stop();
    };
  }, [isHealthy, isWarning]);

  // Subsystem health items derived directly from real telemetry
  const subsystems = [
    {
      id: 'temp',
      icon: 'thermometer' as const,
      label: language === 'hi' ? 'तापमान (Temperature)' : 'Temperature',
      value: `${telemetry.temperature.toFixed(1)}°C`,
      status: telemetry.temperature <= 5.5 ? 'Optimal' : 'High Alert',
      isOk: telemetry.temperature <= 5.5,
      target: '0.5°C - 5.5°C',
    },
    {
      id: 'hum',
      icon: 'water-percent' as const,
      label: language === 'hi' ? 'आर्द्रता (Humidity)' : 'Humidity',
      value: `${telemetry.humidity}%`,
      status: telemetry.humidity >= 85 && telemetry.humidity <= 95 ? 'Optimal' : 'Normal',
      isOk: telemetry.humidity >= 80 && telemetry.humidity <= 95,
      target: '85% - 95%',
    },
    {
      id: 'bat',
      icon: 'battery-charging-80' as const,
      label: language === 'hi' ? 'बैटरी रिजर्व (Battery)' : 'LiFePO4 Battery',
      value: `${telemetry.batteryLevel}%`,
      status: telemetry.batteryLevel >= 25 ? 'Healthy' : 'Low Reserve',
      isOk: telemetry.batteryLevel >= 25,
      target: `${telemetry.batteryVoltage.toFixed(1)}V`,
    },
    {
      id: 'wind',
      icon: 'weather-windy' as const,
      label: language === 'hi' ? 'पवन/सोलर ऊर्जा (Power)' : 'VAWT Generation',
      value: `${telemetry.windGenerationKw} kW`,
      status: telemetry.windGenerationKw > 0 ? 'Active' : 'Standby',
      isOk: true,
      target: `${telemetry.windSpeed} km/h wind`,
    },
    {
      id: 'storage',
      icon: 'snowflake' as const,
      label: language === 'hi' ? 'उपलब्ध क्षमता (Storage)' : 'Chamber Capacity',
      value: `${telemetry.capacityUsedPercentage}%`,
      status: `${telemetry.capacityUsedKg} / ${telemetry.capacityMaxKg} kg`,
      isOk: true,
      target: `${telemetry.capacityMaxKg - telemetry.capacityUsedKg} kg free`,
    },
  ];

  return (
    <>
      {/* Icon Container inside the Green Banner */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Cold Storage System Health status icon. Click for subsystem diagnostics."
        accessibilityHint="Opens a breakdown of temperature, humidity, battery, power, and storage capacity."
        style={[styles.touchWrapper, { width: size, height: size }]}
      >
        <Animated.View
          style={[
            styles.glassContainer,
            {
              width: size,
              height: size,
              borderRadius: size * 0.32,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          {/* Main Cold Storage Snowflake Icon */}
          <MaterialCommunityIcons name="snowflake" size={size * 0.52} color="#ffffff" />

          {/* Dynamic Status Check/Alert Badge */}
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: isHealthy ? '#16a34a' : isWarning ? '#f59e0b' : '#ef4444',
              },
            ]}
          >
            <MaterialCommunityIcons
              name={isHealthy ? 'check' : isWarning ? 'alert' : 'exclamation'}
              size={10}
              color="#ffffff"
            />
          </View>
        </Animated.View>
      </TouchableOpacity>

      {/* Interactive Subsystem Diagnostics Modal Popover */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.popoverCard,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                    shadowColor: theme.shadowColor,
                  },
                ]}
              >
                {/* Header */}
                <View style={[styles.popoverHeader, { borderBottomColor: theme.borderLight }]}>
                  <View style={styles.headerLeft}>
                    <View style={[styles.headerIconCircle, { backgroundColor: theme.primaryLight }]}>
                      <MaterialCommunityIcons name="shield-check" size={18} color={theme.primary} />
                    </View>
                    <View>
                      <Text style={[styles.popoverTitle, { color: theme.textPrimary }]}>
                        {language === 'hi' ? 'सिस्टम स्वास्थ्य स्थिति' : 'Cold Storage Diagnostics'}
                      </Text>
                      <Text style={[styles.popoverSub, { color: theme.textMuted }]}>
                        {isHealthy
                          ? language === 'hi'
                            ? 'सभी सब-सिस्टम सही से काम कर रहे हैं'
                            : 'All calibrated sensors optimal'
                          : language === 'hi'
                          ? 'कुछ पैरामीटर्स पर ध्यान दें'
                          : 'Check flagged parameters'}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                    <Feather name="x" size={18} color={theme.textMuted} />
                  </TouchableOpacity>
                </View>

                {/* Subsystem Health Breakdown Rows */}
                <View style={styles.subsystemsList}>
                  {subsystems.map((item) => (
                    <View
                      key={item.id}
                      style={[
                        styles.subsystemRow,
                        {
                          backgroundColor: item.isOk
                            ? (themeMode === 'DARK' ? '#182742' : theme.backgroundSubtle)
                            : theme.dangerLight,
                          borderColor: item.isOk ? theme.borderLight : theme.danger,
                        },
                      ]}
                    >
                      <View style={styles.rowLeft}>
                        <MaterialCommunityIcons
                          name={item.icon}
                          size={18}
                          color={item.isOk ? theme.primary : theme.danger}
                        />
                        <View>
                          <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>
                            {item.label}
                          </Text>
                          <Text style={[styles.rowTarget, { color: theme.textMuted }]}>
                            Target: {item.target}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.rowRight}>
                        <Text style={[styles.rowValue, { color: theme.textPrimary }]}>
                          {item.value}
                        </Text>
                        <View
                          style={[
                            styles.statusPill,
                            {
                              backgroundColor: item.isOk ? theme.primaryLight : theme.dangerLight,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusPillText,
                              { color: item.isOk ? theme.primaryDark : theme.danger },
                            ]}
                          >
                            {item.status}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Footer Note */}
                <View style={[styles.popoverFooter, { borderTopColor: theme.borderLight }]}>
                  <Text style={[styles.footerText, { color: theme.textMuted }]}>
                    Overall Health Index: <Text style={{ fontWeight: '800', color: theme.primary }}>{healthScore}% Optimal</Text>
                  </Text>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  touchWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  glassContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  statusBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 15,
    height: 15,
    borderRadius: 7.5,
    borderWidth: 1.5,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  popoverCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  popoverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  headerIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popoverTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  popoverSub: {
    fontSize: 11,
    marginTop: 1,
  },
  closeBtn: {
    padding: 4,
  },
  subsystemsList: {
    gap: 8,
  },
  subsystemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  rowLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  rowTarget: {
    fontSize: 9.5,
    marginTop: 1,
  },
  rowRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  rowValue: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  statusPill: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: '800',
  },
  popoverFooter: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
