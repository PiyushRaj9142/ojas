import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Animated,
  Easing,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../i18n/LanguageContext';

interface FloatingAssistantButtonProps {
  onPress: () => void;
  language?: string;
}

export default function FloatingAssistantButton({
  onPress,
  language: propLanguage,
}: FloatingAssistantButtonProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const { language: ctxLanguage, t } = useLanguage();
  const language = propLanguage || ctxLanguage;

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View
      style={[
        styles.container,
        isDesktop ? styles.desktopPos : styles.mobilePos,
      ]}
      pointerEvents="box-none"
    >
      {/* Subtle Glowing Pulse Aura */}
      <Animated.View
        style={[
          styles.pulseRing,
          isDesktop ? styles.desktopPulseRing : styles.mobilePulseRing,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
        pointerEvents="none"
      />

      <TouchableOpacity
        style={styles.touchable}
        onPress={onPress}
        activeOpacity={0.85}
        accessibilityLabel="Open AI Agronomist Assistant"
      >
        <LinearGradient
          colors={['#10b981', '#0284c7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, isDesktop ? styles.desktopGradient : styles.mobileGradient]}
        >
          <MaterialCommunityIcons name="robot-happy" size={22} color="#ffffff" />

          {isDesktop && (
            <View style={styles.textBlock}>
              <Text style={styles.mainText}>{t('actionAssistant' as any, 'AI Assistant')}</Text>
              <Text style={styles.subText}>{language === 'hi' ? 'किसान वाणी' : 'Ask Storage AI'}</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Positioned safely 86px above the bottom edge of SafeAreaView (BottomNav is 0px - 68px tall)
  mobilePos: {
    bottom: 86,
    right: 16,
  },
  desktopPos: {
    bottom: 86,
    right: 24,
  },
  mobilePulseRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  desktopPulseRing: {
    width: 140,
    height: 48,
    borderRadius: 24,
  },
  pulseRing: {
    position: 'absolute',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  touchable: {
    borderRadius: 25,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  desktopGradient: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 24,
    gap: 8,
  },
  textBlock: {
    flexDirection: 'column',
  },
  mainText: {
    color: '#ffffff',
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  subText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 8.5,
    fontWeight: '600',
  },
});
