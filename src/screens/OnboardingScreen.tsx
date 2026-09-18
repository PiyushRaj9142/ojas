import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';

interface OnboardingScreenProps {
  onFinish: () => void;
}

export default function OnboardingScreen({ onFinish }: OnboardingScreenProps) {
  const { theme } = useTheme();
  const { language, t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: 'Protect Your Harvest',
      titleHi: 'अपनी फसल को सुरक्षित रखें',
      description: 'Store your crops safely at optimal temperatures and reduce post-harvest losses by up to 80%.',
      icon: 'fruit-cherries',
      iconColor: colors.primary,
      bgColor: colors.primaryLight,
      gradient: ['#16a34a', '#15803d'],
    },
    {
      title: 'Powered by Wind Energy',
      titleHi: 'स्वच्छ पवन ऊर्जा द्वारा संचालित',
      description: 'Use locally generated Vertical Axis Wind Turbine energy with hybrid battery storage — 100% off-grid.',
      icon: 'wind-turbine',
      iconColor: colors.secondary,
      bgColor: colors.secondaryLight,
      gradient: ['#0284c7', '#0369a1'],
    },
    {
      title: 'Your Smart Farmer Assistant',
      titleHi: 'आपका स्मार्ट किसान सहायक',
      description: 'Monitor storage telemetry in real-time, get AI crop freshness alerts, and mandi selling recommendations.',
      icon: 'robot-happy',
      iconColor: colors.primary,
      bgColor: colors.primaryLight,
      gradient: ['#16a34a', '#0284c7'],
    },
  ];

  const slide = slides[currentSlide];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      onFinish();
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Skip Button */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onFinish} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Main Illustration Card */}
      <View style={styles.centerContent}>
        <View style={[styles.illustrationBox, { backgroundColor: slide.bgColor }]}>
          <MaterialCommunityIcons name={slide.icon as any} size={84} color={slide.iconColor} />
        </View>

        {/* Title & Description */}
        <Text style={[styles.title, { color: theme.textPrimary }]}>{slide.title}</Text>
        {language !== 'en' && <Text style={[styles.titleHi, { color: theme.primary }]}>{slide.titleHi}</Text>}
        <Text style={[styles.description, { color: theme.textSecondary }]}>{slide.description}</Text>
      </View>

      {/* Pagination & Next/Get Started Button */}
      <View style={styles.footer}>
        <View style={styles.paginationRow}>
          {slides.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.paginationDot,
                { backgroundColor: theme.border },
                currentSlide === idx && [styles.paginationDotActive, { backgroundColor: theme.primary }],
              ]}
            />
          ))}
        </View>

        <TouchableOpacity 
          style={styles.actionBtn}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={slide.gradient as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.btnGradient}
          >
            <Text style={styles.btnText}>
              {currentSlide === slides.length - 1 ? t('verifyOtp', 'Get Started →') : `${t('demoNext', 'Next')} →`}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  skipBtn: {
    padding: 8,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  centerContent: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  illustrationBox: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  titleHi: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 4,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 12,
  },
  footer: {
    alignItems: 'center',
    gap: 20,
  },
  paginationRow: {
    flexDirection: 'row',
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.borderDark,
  },
  paginationDotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  actionBtn: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
  },
  btnGradient: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
});
