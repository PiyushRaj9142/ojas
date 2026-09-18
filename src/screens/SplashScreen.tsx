import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  Platform,
  Image,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../i18n/LanguageContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

const ECOSYSTEM_NODES = [
  { id: 'solar', icon: 'white-balance-sunny', label: 'Solar PV', sub: '2.4 kW', color: '#f59e0b' },
  { id: 'wind', icon: 'weather-windy', label: 'Wind VAWT', sub: '1.4 kW', color: '#38bdf8' },
  { id: 'battery', icon: 'battery-charging-80', label: 'LiFePO4', sub: '84% SOC', color: '#10b981' },
  { id: 'cooling', icon: 'snowflake', label: 'Inverter', sub: '4.8°C', color: '#06b6d4' },
  { id: 'storage', icon: 'fruit-cherries', label: 'Produce', sub: '342 kg', color: '#ec4899' },
  { id: 'ai', icon: 'robot-outline', label: 'Gemini AI', sub: '12 Lang', color: '#8b5cf6' },
];

const LOADING_MILESTONES = [
  { progress: 15, text: 'Initializing IoT Chamber Mesh & Sensor Hub...' },
  { progress: 38, text: 'Calibrating Micro-Climate Core (4.8°C • 82.5% RH)...' },
  { progress: 65, text: 'Connecting Solar PV & Wind Clean Energy (+2.6 kW)...' },
  { progress: 88, text: 'Powering Gemini 2.5 AI Agronomist (12 Languages)...' },
  { progress: 100, text: 'Cold Storage Systems Optimal • Welcome Kisan!' },
];

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const { t } = useLanguage();

  // Primary Entrance and Exit Transitions
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const exitFadeAnim = useRef(new Animated.Value(1)).current;

  // Centerpiece Logo Animations
  const logoScaleAnim = useRef(new Animated.Value(0.75)).current;
  const logoFloatAnim = useRef(new Animated.Value(0)).current;
  const logoBreatheAnim = useRef(new Animated.Value(1)).current;
  const sunRotateAnim = useRef(new Animated.Value(0)).current;
  const frostPulseAnim = useRef(new Animated.Value(0.85)).current;

  // Text and Typography Animations
  const welcomeFadeAnim = useRef(new Animated.Value(0)).current;
  const welcomeSlideAnim = useRef(new Animated.Value(25)).current;
  const taglineFadeAnim = useRef(new Animated.Value(0)).current;
  const taglineSlideAnim = useRef(new Animated.Value(20)).current;

  // Ecosystem Pipeline and Progress Bar
  const nodesFadeAnim = useRef(new Animated.Value(0)).current;
  const nodesSlideAnim = useRef(new Animated.Value(25)).current;
  const progressBarAnim = useRef(new Animated.Value(0)).current;

  // Floating Ambient Atmosphere Particles
  const particleFloat1 = useRef(new Animated.Value(0)).current;
  const particleFloat2 = useRef(new Animated.Value(0)).current;
  const particleFloat3 = useRef(new Animated.Value(0)).current;
  const particleRotate1 = useRef(new Animated.Value(0)).current;

  // Milestone State
  const [loadingText, setLoadingText] = useState(LOADING_MILESTONES[0].text);
  const [activeNodeIdx, setActiveNodeIdx] = useState(0);

  useEffect(() => {
    // 1. Entrance Fade & Spring Logo Pop
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(logoScaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 35,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Continuous Image Floating & Breathing Animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoFloatAnim, {
          toValue: -10,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(logoFloatAnim, {
          toValue: 10,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(logoBreatheAnim, {
          toValue: 1.04,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(logoBreatheAnim, {
          toValue: 0.98,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 3. Continuous Celestial Sun & Frost Ring Rotation
    Animated.loop(
      Animated.timing(sunRotateAnim, {
        toValue: 1,
        duration: 12000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // 4. Frost Aura Glow Pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(frostPulseAnim, {
          toValue: 1.25,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(frostPulseAnim, {
          toValue: 0.85,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 5. Floating Ambient Particles (Leaves, Sun Sparks, Flakes)
    Animated.loop(
      Animated.sequence([
        Animated.timing(particleFloat1, { toValue: -22, duration: 2100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(particleFloat1, { toValue: 14, duration: 2100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(particleFloat2, { toValue: 18, duration: 2500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(particleFloat2, { toValue: -16, duration: 2500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(particleFloat3, { toValue: -18, duration: 1900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(particleFloat3, { toValue: 12, duration: 1900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(particleRotate1, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // 6. Staggered Text Animations (Welcome to OJAS + Taglines)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(welcomeFadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(welcomeSlideAnim, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, 200);

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(taglineFadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(taglineSlideAnim, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, 450);

    // 7. Staggered Pipeline Nodes
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(nodesFadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(nodesSlideAnim, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, 650);

    // 8. Progress Bar Fill & Milestones (2.3s total)
    Animated.timing(progressBarAnim, {
      toValue: 1,
      duration: 2200,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    }).start();

    const t1 = setTimeout(() => { setLoadingText(LOADING_MILESTONES[1].text); setActiveNodeIdx(1); }, 450);
    const t2 = setTimeout(() => { setLoadingText(LOADING_MILESTONES[2].text); setActiveNodeIdx(2); }, 900);
    const t3 = setTimeout(() => { setLoadingText(LOADING_MILESTONES[3].text); setActiveNodeIdx(4); }, 1400);
    const t4 = setTimeout(() => { setLoadingText(LOADING_MILESTONES[4].text); setActiveNodeIdx(5); }, 1900);

    // 9. Finish Transition (Starts at 2.3s, fades out in 350ms, redirects to Login)
    const finishTimer = setTimeout(() => {
      handleExit();
    }, 2350);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  const handleExit = () => {
    Animated.timing(exitFadeAnim, {
      toValue: 0,
      duration: 350,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      onFinish();
    });
  };

  const sunSpin = sunRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const flakeSpin = particleRotate1.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progressBarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: exitFadeAnim }]}>
      <LinearGradient
        colors={['#02160d', '#05291a', '#031924', '#020d14']}
        style={styles.gradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        {/* Ambient Glowing Background Auras */}
        <Animated.View
          style={[
            styles.ambientSunAura,
            {
              transform: [{ scale: frostPulseAnim }, { rotate: sunSpin }],
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(245, 158, 11, 0.18)', 'rgba(16, 185, 129, 0.12)', 'transparent']}
            style={styles.auraGradient}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.ambientFrostAura,
            {
              transform: [{ scale: frostPulseAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(56, 189, 248, 0.16)', 'rgba(6, 182, 212, 0.08)', 'transparent']}
            style={styles.auraGradient}
          />
        </Animated.View>

        {/* Floating Motifs: Solar Sunburst, Leaves, Snowflakes */}
        <Animated.View style={[styles.floatingParticle, { top: 60, left: 28, transform: [{ translateY: particleFloat1 }] }]}>
          <MaterialCommunityIcons name="white-balance-sunny" size={28} color="#f59e0b" style={{ opacity: 0.7 }} />
        </Animated.View>

        <Animated.View style={[styles.floatingParticle, { top: 110, right: 32, transform: [{ translateY: particleFloat2 }, { rotate: flakeSpin }] }]}>
          <MaterialCommunityIcons name="snowflake" size={26} color="#38bdf8" style={{ opacity: 0.7 }} />
        </Animated.View>

        <Animated.View style={[styles.floatingParticle, { top: SCREEN_HEIGHT * 0.38, left: 20, transform: [{ translateY: particleFloat3 }] }]}>
          <MaterialCommunityIcons name="leaf" size={24} color="#10b981" style={{ opacity: 0.65 }} />
        </Animated.View>

        <Animated.View style={[styles.floatingParticle, { top: SCREEN_HEIGHT * 0.42, right: 24, transform: [{ translateY: particleFloat1 }] }]}>
          <MaterialCommunityIcons name="weather-windy" size={26} color="#06b6d4" style={{ opacity: 0.65 }} />
        </Animated.View>

        <Animated.View style={[styles.floatingParticle, { bottom: 190, left: 35, transform: [{ translateY: particleFloat2 }] }]}>
          <MaterialCommunityIcons name="lightning-bolt" size={22} color="#fbbf24" style={{ opacity: 0.6 }} />
        </Animated.View>

        <Animated.View style={[styles.floatingParticle, { bottom: 210, right: 38, transform: [{ translateY: particleFloat3 }] }]}>
          <MaterialCommunityIcons name="sprout" size={22} color="#10b981" style={{ opacity: 0.6 }} />
        </Animated.View>

        {/* Center Main Stage */}
        <Animated.View style={[styles.centerStage, { opacity: fadeAnim }]}>
          {/* Animated Official Brand Logo with Halo */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                transform: [
                  { scale: Animated.multiply(logoScaleAnim, logoBreatheAnim) },
                  { translateY: logoFloatAnim },
                ],
              },
            ]}
          >
            {/* Spinning Radiant Halo Ring */}
            <Animated.View
              style={[
                styles.haloRing,
                {
                  transform: [{ rotate: sunSpin }],
                },
              ]}
            >
              <LinearGradient
                colors={['#f59e0b', '#10b981', '#38bdf8', '#06b6d4', '#10b981', '#f59e0b']}
                style={styles.haloGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            </Animated.View>

            {/* Logo Image Card */}
            <View style={styles.logoCard}>
              <Image
                source={require('../../assets/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
          </Animated.View>

          {/* Animated Stylish "Welcome to OJAS" */}
          <Animated.View
            style={[
              styles.welcomeSection,
              {
                opacity: welcomeFadeAnim,
                transform: [{ translateY: welcomeSlideAnim }],
              },
            ]}
          >
            {/* Sub-badge */}
            <View style={styles.solarBadge}>
              <MaterialCommunityIcons name="solar-power" size={14} color="#f59e0b" />
              <Text style={styles.solarBadgeText}>HYBRID SOLAR & WIND COLD CHAIN</Text>
              <MaterialCommunityIcons name="snowflake" size={13} color="#38bdf8" />
            </View>

            {/* Stylish Main Title */}
            <Text style={styles.welcomeTitle}>
              {t('welcomeToOjas', 'Welcome to OJAS')}
            </Text>

            {/* Glowing Brand Accent */}
            <View style={styles.titleUnderline}>
              <LinearGradient
                colors={['#10b981', '#38bdf8', '#f59e0b']}
                style={styles.underlineGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
          </Animated.View>

          {/* Animated Tagline matching the image */}
          <Animated.View
            style={[
              styles.taglineSection,
              {
                opacity: taglineFadeAnim,
                transform: [{ translateY: taglineSlideAnim }],
              },
            ]}
          >
            <Text style={styles.taglinePrimary}>
              {t('splashTagline1', 'CLEAN ENERGY • COOLER HARVESTS • BRIGHTER TOMORROWS')}
            </Text>
            <Text style={styles.taglineSecondary}>
              {t('splashTagline2', 'FOR A FRESHER INDIA • 100% SOLAR & WIND POWERED')}
            </Text>
          </Animated.View>
        </Animated.View>

        {/* Live Ecosystem Pipeline Flow */}
        <Animated.View
          style={[
            styles.flowCard,
            {
              opacity: nodesFadeAnim,
              transform: [{ translateY: nodesSlideAnim }],
            },
          ]}
        >
          <View style={styles.flowHeader}>
            <View style={styles.livePulseDot} />
            <Text style={styles.flowHeaderTitle}>LIVE CHAMBER IOT TELEMETRY</Text>
            <Text style={styles.flowLiveTag}>ONLINE • SC-001</Text>
          </View>

          <View style={styles.nodesRow}>
            {ECOSYSTEM_NODES.map((node, idx) => {
              const isHighlight = idx <= activeNodeIdx;
              return (
                <View key={node.id} style={styles.nodeBox}>
                  <View
                    style={[
                      styles.nodeCircle,
                      { borderColor: node.color },
                      isHighlight && {
                        backgroundColor: `${node.color}25`,
                        shadowColor: node.color,
                        shadowOpacity: 0.7,
                        shadowRadius: 10,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={node.icon as any}
                      size={18}
                      color={isHighlight ? node.color : '#64748b'}
                    />
                  </View>
                  <Text style={[styles.nodeTitle, isHighlight && { color: '#ffffff', fontWeight: '800' }]}>
                    {node.label}
                  </Text>
                  <Text style={[styles.nodeValue, { color: node.color }]}>
                    {node.sub}
                  </Text>
                </View>
              );
            })}
          </View>
        </Animated.View>

        {/* Footer with Progress Bar, Milestones & Enter Button */}
        <View style={styles.footerContainer}>
          <View style={styles.progressBarWrapper}>
            <Animated.View style={[styles.progressBarActive, { width: progressWidth }]}>
              <LinearGradient
                colors={['#10b981', '#38bdf8', '#fbbf24']}
                style={styles.progressFillGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </Animated.View>
          </View>

          <View style={styles.milestoneRow}>
            <Feather name="activity" size={13} color="#38bdf8" />
            <Text style={styles.milestoneText} numberOfLines={1}>
              {loadingText}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.enterButton}
            onPress={handleExit}
            activeOpacity={0.8}
          >
            <Text style={styles.enterButtonText}>
              {t('enterChamber', 'Enter Cold Chamber →')}
            </Text>
          </TouchableOpacity>

          <Text style={styles.kisanCopyright}>
            OJAS AgriTech • Nashik, Maharashtra • 12 Indian Languages
          </Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#02160d',
  },
  gradient: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Platform.OS === 'ios' ? 44 : 36,
    paddingHorizontal: 16,
  },
  ambientSunAura: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.08,
    width: 320,
    height: 320,
    borderRadius: 160,
  },
  ambientFrostAura: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.16,
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  auraGradient: {
    flex: 1,
    borderRadius: 160,
  },
  floatingParticle: {
    position: 'absolute',
    zIndex: 1,
  },
  centerStage: {
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 10 : 8,
    zIndex: 2,
    width: '100%',
  },
  logoContainer: {
    width: 170,
    height: 170,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  haloRing: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    padding: 3,
    shadowColor: '#10b981',
    shadowOpacity: 0.6,
    shadowRadius: 18,
    elevation: 10,
  },
  haloGradient: {
    flex: 1,
    borderRadius: 85,
  },
  logoCard: {
    width: 156,
    height: 156,
    borderRadius: 78,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 12,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  welcomeSection: {
    alignItems: 'center',
    marginTop: 4,
  },
  solarBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(5, 41, 26, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    marginBottom: 8,
  },
  solarBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#34d399',
    letterSpacing: 1,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 2,
    textAlign: 'center',
    textShadowColor: 'rgba(16, 185, 129, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
    fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue-Bold' : 'sans-serif-black',
  },
  titleUnderline: {
    width: 80,
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 6,
  },
  underlineGradient: {
    flex: 1,
  },
  taglineSection: {
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
  },
  taglinePrimary: {
    fontSize: 11,
    fontWeight: '800',
    color: '#fbbf24',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  taglineSecondary: {
    fontSize: 10,
    fontWeight: '600',
    color: '#a7f3d0',
    letterSpacing: 0.8,
    marginTop: 3,
    textAlign: 'center',
  },
  flowCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: 'rgba(4, 28, 20, 0.8)',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    zIndex: 2,
    marginVertical: 10,
  },
  flowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 6,
  },
  flowHeaderTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#e2e8f0',
    letterSpacing: 1,
    flex: 1,
  },
  flowLiveTag: {
    fontSize: 9,
    fontWeight: '800',
    color: '#34d399',
    letterSpacing: 0.5,
  },
  nodesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nodeBox: {
    alignItems: 'center',
    flex: 1,
  },
  nodeCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    backgroundColor: '#02160d',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  nodeTitle: {
    fontSize: 9,
    color: '#94a3b8',
    fontWeight: '600',
  },
  nodeValue: {
    fontSize: 8,
    fontWeight: '700',
    marginTop: 1,
  },
  footerContainer: {
    width: '100%',
    maxWidth: 440,
    alignItems: 'center',
    zIndex: 2,
  },
  progressBarWrapper: {
    width: '100%',
    height: 5,
    backgroundColor: 'rgba(15, 45, 32, 0.9)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  progressBarActive: {
    height: '100%',
    borderRadius: 3,
  },
  progressFillGradient: {
    flex: 1,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  milestoneText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#cbd5e1',
    textAlign: 'center',
  },
  enterButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#10b981',
    marginBottom: 8,
  },
  enterButtonText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#34d399',
    letterSpacing: 0.5,
  },
  kisanCopyright: {
    fontSize: 9,
    color: '#64748b',
    fontWeight: '500',
  },
});
