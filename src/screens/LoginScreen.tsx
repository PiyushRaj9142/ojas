import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
  Easing,
} from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';
import { INDIAN_LANGUAGES } from '../i18n/translations';
import { UserProfile, LanguageCode } from '../types/user';
import { REGISTERED_USERS, findUserByIdentifier, registerNewUser } from '../data/mockUsers';
import LanguageSelectorModal from '../components/LanguageSelectorModal';
import ThemeSwitcher from '../components/ThemeSwitcher';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_DESKTOP = SCREEN_WIDTH >= 768;
const CARD_WIDTH = IS_DESKTOP ? 860 : Math.min(SCREEN_WIDTH - 24, 440);
const HERO_WIDTH = IS_DESKTOP ? 370 : '100%';
const FORM_WIDTH = IS_DESKTOP ? CARD_WIDTH - 370 : '100%';

interface LoginScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const { theme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  // Active Auth Mode
  const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('9876543210');
  const [loginPassword, setLoginPassword] = useState('1234');

  // Signup Form State
  const [signupMobile, setSignupMobile] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupLocation, setSignupLocation] = useState('Nashik, Maharashtra');
  const [signupPassword, setSignupPassword] = useState('1234');

  // Generated Storage ID State
  const [previewStorageId, setPreviewStorageId] = useState(`SC-${Math.floor(100 + Math.random() * 900)}`);

  // OTP Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [expectedOtp, setExpectedOtp] = useState('');
  const [pendingUser, setPendingUser] = useState<UserProfile | null>(null);

  // --- Animation Controllers ---
  const screenEntranceAnim = useRef(new Animated.Value(0)).current;
  const authModeAnim = useRef(new Animated.Value(0)).current; // 0 = LOGIN, 1 = SIGNUP
  const formFadeAnim = useRef(new Animated.Value(1)).current;
  const logoFloatAnim = useRef(new Animated.Value(0)).current;
  const haloRotateAnim = useRef(new Animated.Value(0)).current;

  // Active language option
  const activeLangOption = INDIAN_LANGUAGES.find((l) => l.code === language) || INDIAN_LANGUAGES[0];

  useEffect(() => {
    // 1. Mount Entrance Animation
    Animated.timing(screenEntranceAnim, {
      toValue: 1,
      duration: 450,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // 2. Continuous Hero Floating & Rotating Halo
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoFloatAnim, { toValue: -6, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(logoFloatAnim, { toValue: 6, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(haloRotateAnim, { toValue: 1, duration: 12000, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, []);

  const switchAuthMode = (mode: 'LOGIN' | 'SIGNUP') => {
    if (mode === authMode) return;
    setErrorMessage(null);

    // Cross-fade form content smoothly
    Animated.timing(formFadeAnim, {
      toValue: 0,
      duration: 120,
      useNativeDriver: true,
    }).start(() => {
      setAuthMode(mode);
      if (mode === 'SIGNUP') {
        setPreviewStorageId(`SC-${Math.floor(100 + Math.random() * 900)}`);
      }
      Animated.timing(formFadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });

    // Spring physics slide for desktop
    Animated.spring(authModeAnim, {
      toValue: mode === 'SIGNUP' ? 1 : 0,
      friction: 8,
      tension: 45,
      useNativeDriver: true,
    }).start();
  };

  const handleLogin = () => {
    if (!loginIdentifier.trim()) {
      setErrorMessage(t('enterMobile' as any, 'Please enter your Mobile Number or Storage ID'));
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      setLoading(false);
      const user = findUserByIdentifier(loginIdentifier);
      if (user) {
        onLoginSuccess({
          ...user,
          language,
          isLoggedIn: true,
        });
      } else {
        const cleanMobile = loginIdentifier.replace(/\D/g, '').slice(-10) || '9876543210';
        const fallbackStorageId = loginIdentifier.toUpperCase().startsWith('SC-')
          ? loginIdentifier.toUpperCase()
          : `SC-${Math.floor(100 + Math.random() * 900)}`;

        const newUser = registerNewUser({
          name: 'Ramesh Patel (रमेश पटेल)',
          mobile: cleanMobile,
          location: 'Nashik, Maharashtra',
          coldStorageId: fallbackStorageId,
          language,
        });
        onLoginSuccess(newUser);
      }
    }, 500);
  };

  const handleSignupSubmit = () => {
    const cleanMobile = signupMobile.replace(/\D/g, '');
    if (cleanMobile.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!signupName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      setLoading(false);
      const generatedOtp = String(Math.floor(1000 + Math.random() * 9000));
      setExpectedOtp(generatedOtp);
      setOtpCode('');

      const newUser: UserProfile = {
        id: `usr-${Date.now()}`,
        name: signupName.trim(),
        mobile: cleanMobile.slice(-10),
        farmName: `${signupName.trim()} Agro Farm (सोलर फार्म)`,
        coldStorageId: previewStorageId,
        location: signupLocation.trim() || 'Nashik, Maharashtra',
        totalCapacityKg: 500,
        language,
        tempUnit: '°C',
        weightUnit: 'kg',
        notificationsEnabled: true,
        darkMode: false,
        themeMode: 'LIGHT',
        demoMode: false,
        isLoggedIn: true,
      };

      setPendingUser(newUser);
      setShowOtpModal(true);
    }, 450);
  };

  const handleVerifyOtpAndComplete = () => {
    if (otpCode.trim() !== expectedOtp && otpCode.trim() !== '1234') {
      setErrorMessage('Invalid OTP code. Please try again or tap auto-fill.');
      return;
    }

    if (pendingUser) {
      registerNewUser({
        name: pendingUser.name,
        mobile: pendingUser.mobile,
        location: pendingUser.location,
        coldStorageId: pendingUser.coldStorageId,
        language,
      });
      setShowOtpModal(false);
      onLoginSuccess(pendingUser);
    }
  };

  const handleSelectDemoUser = (user: UserProfile) => {
    setLoginIdentifier(user.coldStorageId);
    setLoginPassword('1234');
    setErrorMessage(null);
  };

  // Interpolations
  const haloSpin = haloRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Desktop Side-Swap Slide Interpolations
  const heroTranslateX = authModeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, typeof FORM_WIDTH === 'number' ? FORM_WIDTH : 490],
  });

  const formTranslateX = authModeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -(typeof HERO_WIDTH === 'number' ? HERO_WIDTH : 370)],
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Bar with Language Selector & Theme Switcher */}
      <View style={[styles.topBar, { borderBottomColor: theme.border }]}>
        <View style={styles.topBarBrand}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.topBarLogo}
            resizeMode="cover"
          />
          <Text style={[styles.topBarBrandTitle, { color: theme.textPrimary }]}>OJAS</Text>
        </View>

        <View style={styles.topBarActions}>
          <ThemeSwitcher language={language} />

          {/* 12-Language Selector Button */}
          <TouchableOpacity
            style={[styles.langBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => setIsLangModalOpen(true)}
            activeOpacity={0.8}
          >
            <Text style={[styles.langBtnText, { color: theme.textPrimary }]}>
              {activeLangOption.flag} {activeLangOption.nativeName.split(' ')[0]}
            </Text>
            <Feather name="chevron-down" size={14} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={[
            styles.authCardWrapper,
            {
              width: CARD_WIDTH,
              opacity: screenEntranceAnim,
              transform: [
                {
                  translateY: screenEntranceAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [18, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Main Split Card Container */}
          <View
            style={[
              styles.splitCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
                flexDirection: IS_DESKTOP ? 'row' : 'column',
              },
            ]}
          >
            {/* 1. Hero Showcase (Left on Desktop, Top on Mobile) */}
            <Animated.View
              style={[
                styles.heroColumn,
                IS_DESKTOP ? styles.desktopHeroColumn : styles.mobileHeroColumn,
                {
                  backgroundColor: '#02160d',
                  transform: IS_DESKTOP ? [{ translateX: heroTranslateX }] : [],
                },
              ]}
            >
              {/* Spinning Solar Aura */}
              <Animated.View
                style={[
                  styles.heroAura,
                  IS_DESKTOP ? styles.desktopHeroAura : styles.mobileHeroAura,
                  {
                    transform: [{ rotate: haloSpin }],
                  },
                ]}
              >
                <LinearGradient
                  colors={['#f59e0b', '#10b981', '#38bdf8', '#f59e0b']}
                  style={styles.heroAuraGradient}
                />
              </Animated.View>

              {IS_DESKTOP ? (
                // Desktop Hero Column
                <>
                  <Animated.View
                    style={[
                      styles.logoCircle,
                      {
                        transform: [{ translateY: logoFloatAnim }],
                      },
                    ]}
                  >
                    <Image
                      source={require('../../assets/logo.png')}
                      style={styles.heroLogoImage}
                      resizeMode="contain"
                    />
                  </Animated.View>

                  <Text style={styles.heroTitle}>OJAS</Text>
                  <View style={styles.heroBadge}>
                    <MaterialCommunityIcons name="solar-power" size={13} color="#fbbf24" />
                    <Text style={styles.heroBadgeText}>100% SOLAR COLD CHAIN</Text>
                  </View>

                  <Text style={styles.heroTagline}>
                    Clean Energy • Cooler Harvests • Brighter Tomorrows
                  </Text>
                  <Text style={styles.heroSubTagline}>
                    For a Fresher India • 12 Indian Languages
                  </Text>

                  <View style={styles.featurePillsRow}>
                    <View style={styles.featurePill}>
                      <MaterialCommunityIcons name="snowflake" size={13} color="#38bdf8" />
                      <Text style={styles.featurePillText}>4.8°C Chamber</Text>
                    </View>
                    <View style={styles.featurePill}>
                      <MaterialCommunityIcons name="battery-charging-80" size={13} color="#10b981" />
                      <Text style={styles.featurePillText}>LiFePO4 Power</Text>
                    </View>
                    <View style={styles.featurePill}>
                      <MaterialCommunityIcons name="robot" size={13} color="#ec4899" />
                      <Text style={styles.featurePillText}>Gemini AI</Text>
                    </View>
                  </View>
                </>
              ) : (
                // Compact Mobile Hero Header
                <View style={styles.mobileHeroContent}>
                  <Image
                    source={require('../../assets/logo.png')}
                    style={styles.mobileLogoImage}
                    resizeMode="contain"
                  />
                  <View style={styles.mobileHeroText}>
                    <View style={styles.mobileTitleRow}>
                      <Text style={styles.mobileHeroTitle}>OJAS</Text>
                      <View style={styles.mobileHeroBadge}>
                        <MaterialCommunityIcons name="solar-power" size={11} color="#fbbf24" />
                        <Text style={styles.mobileHeroBadgeText}>SOLAR IoT</Text>
                      </View>
                    </View>
                    <Text style={styles.mobileHeroSubText}>
                      Cooler Harvests • 100% Off-Grid Cold Chain
                    </Text>
                  </View>
                </View>
              )}
            </Animated.View>

            {/* 2. Interactive Form Column */}
            <Animated.View
              style={[
                styles.formColumn,
                IS_DESKTOP ? { width: FORM_WIDTH, transform: [{ translateX: formTranslateX }] } : { width: '100%' },
              ]}
            >
              {/* Segmented Tab Switcher */}
              <View style={[styles.tabBar, { backgroundColor: theme.backgroundSubtle, borderColor: theme.border }]}>
                <TouchableOpacity
                  style={[
                    styles.tabItem,
                    authMode === 'LOGIN' && { backgroundColor: theme.primary, borderColor: theme.primary },
                  ]}
                  onPress={() => switchAuthMode('LOGIN')}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.tabText,
                      { color: theme.textPrimary },
                      authMode === 'LOGIN' && { color: '#ffffff', fontWeight: '800' },
                    ]}
                  >
                    {t('switchTabSignIn' as any, 'Sign In')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.tabItem,
                    authMode === 'SIGNUP' && { backgroundColor: theme.primary, borderColor: theme.primary },
                  ]}
                  onPress={() => switchAuthMode('SIGNUP')}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.tabText,
                      { color: theme.textPrimary },
                      authMode === 'SIGNUP' && { color: '#ffffff', fontWeight: '800' },
                    ]}
                  >
                    {t('switchTabSignUp' as any, 'Sign Up')}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Error Banner */}
              {errorMessage && (
                <View style={[styles.errorBox, { backgroundColor: theme.dangerLight, borderColor: theme.danger }]}>
                  <Feather name="alert-circle" size={14} color={theme.danger} />
                  <Text style={[styles.errorText, { color: theme.danger }]}>{errorMessage}</Text>
                </View>
              )}

              {/* Title Header */}
              <Text style={[styles.formHeading, { color: theme.textPrimary }]}>
                {authMode === 'LOGIN'
                  ? t('loginTitle' as any, 'Farmer Login')
                  : t('signupTitle' as any, 'Register New Chamber')}
              </Text>
              <Text style={[styles.formSubHeading, { color: theme.textMuted }]}>
                {authMode === 'LOGIN'
                  ? t('loginSubtitle' as any, 'Enter Mobile Number or Storage ID to access telemetry')
                  : t('signupSubtitle' as any, 'Register your farm & get an auto-generated Solar Chamber ID')}
              </Text>

              {/* Animated Form Body */}
              <Animated.View style={{ opacity: formFadeAnim }}>
                {authMode === 'LOGIN' ? (
                  /* LOGIN FORM */
                  <View style={styles.formFields}>
                    {/* Smart Identifier Input */}
                    <View style={styles.inputGroup}>
                      <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>
                        {t('mobileOrStorageId' as any, 'Mobile Number or Storage ID')}
                      </Text>
                      <View style={[styles.inputWrapper, { backgroundColor: theme.backgroundSubtle, borderColor: theme.border }]}>
                        <MaterialCommunityIcons name="smart-card-outline" size={18} color={theme.primary} style={styles.inputIcon} />
                        <TextInput
                          style={[styles.textInput, { color: theme.textPrimary }]}
                          placeholder={t('mobileOrStorageIdPlaceholder' as any, 'e.g. 9876543210 or SC-001')}
                          placeholderTextColor={theme.textMuted}
                          value={loginIdentifier}
                          onChangeText={(t) => {
                            setLoginIdentifier(t);
                            setErrorMessage(null);
                          }}
                          autoCapitalize="characters"
                          editable={!loading}
                        />
                      </View>
                    </View>

                    {/* Password / PIN Input */}
                    <View style={styles.inputGroup}>
                      <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>
                        {t('enterPassword' as any, 'Password / Security PIN')}
                      </Text>
                      <View style={[styles.inputWrapper, { backgroundColor: theme.backgroundSubtle, borderColor: theme.border }]}>
                        <Feather name="lock" size={17} color={theme.primary} style={styles.inputIcon} />
                        <TextInput
                          style={[styles.textInput, { color: theme.textPrimary }]}
                          placeholder={t('passwordPlaceholder' as any, 'Enter 4-digit PIN or password')}
                          placeholderTextColor={theme.textMuted}
                          value={loginPassword}
                          onChangeText={(t) => {
                            setLoginPassword(t);
                            setErrorMessage(null);
                          }}
                          secureTextEntry={!showPassword}
                          editable={!loading}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                          <Feather name={showPassword ? 'eye-off' : 'eye'} size={16} color={theme.textMuted} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                      style={[styles.submitButton, loading && { opacity: 0.7 }]}
                      onPress={handleLogin}
                      disabled={loading}
                      activeOpacity={0.85}
                    >
                      <LinearGradient colors={['#10b981', '#059669']} style={styles.btnGradient}>
                        {loading ? (
                          <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                          <Text style={styles.submitBtnText}>
                            {t('signInBtn' as any, 'Login to Chamber →')}
                          </Text>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>

                    {/* Demo Accounts Quick-Select */}
                    <View style={styles.demoSection}>
                      <Text style={[styles.demoTitle, { color: theme.textMuted }]}>
                        {t('demoFarmers' as any, 'Quick Demo Farmers (1-Tap Fill)')}
                      </Text>
                      <View style={styles.demoChipsRow}>
                        {REGISTERED_USERS.map((u) => (
                          <TouchableOpacity
                            key={u.id}
                            style={[styles.demoChip, { backgroundColor: theme.backgroundSubtle, borderColor: theme.border }]}
                            onPress={() => handleSelectDemoUser(u)}
                            activeOpacity={0.7}
                          >
                            <Text style={[styles.demoChipText, { color: theme.textPrimary }]}>
                              👤 {u.name.split(' ')[0]} ({u.coldStorageId})
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>
                ) : (
                  /* SIGNUP FORM */
                  <View style={styles.formFields}>
                    {/* Mobile Number */}
                    <View style={styles.inputGroup}>
                      <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>
                        {t('enterMobile' as any, 'Mobile Number / मोबाइल नंबर')}
                      </Text>
                      <View style={[styles.inputWrapper, { backgroundColor: theme.backgroundSubtle, borderColor: theme.border }]}>
                        <Text style={[styles.prefixPhone, { color: theme.textPrimary }]}>🇮🇳 +91</Text>
                        <TextInput
                          style={[styles.textInput, { color: theme.textPrimary }]}
                          placeholder="10-digit mobile number"
                          placeholderTextColor={theme.textMuted}
                          keyboardType="phone-pad"
                          maxLength={10}
                          value={signupMobile}
                          onChangeText={(t) => {
                            setSignupMobile(t.replace(/\D/g, ''));
                            setErrorMessage(null);
                          }}
                          editable={!loading}
                        />
                      </View>
                    </View>

                    {/* Farmer Full Name */}
                    <View style={styles.inputGroup}>
                      <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>
                        {t('farmerFullName' as any, 'Farmer Full Name / किसान का नाम')}
                      </Text>
                      <View style={[styles.inputWrapper, { backgroundColor: theme.backgroundSubtle, borderColor: theme.border }]}>
                        <Feather name="user" size={17} color={theme.primary} style={styles.inputIcon} />
                        <TextInput
                          style={[styles.textInput, { color: theme.textPrimary }]}
                          placeholder={t('farmerNamePlaceholder' as any, 'e.g. Ramesh Patel')}
                          placeholderTextColor={theme.textMuted}
                          value={signupName}
                          onChangeText={(t) => {
                            setSignupName(t);
                            setErrorMessage(null);
                          }}
                          editable={!loading}
                        />
                      </View>
                    </View>

                    {/* Village / Farm Location */}
                    <View style={styles.inputGroup}>
                      <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>
                        {t('farmVillageLocation' as any, 'Village / Location / गाँव का नाम')}
                      </Text>
                      <View style={[styles.inputWrapper, { backgroundColor: theme.backgroundSubtle, borderColor: theme.border }]}>
                        <Feather name="map-pin" size={17} color={theme.primary} style={styles.inputIcon} />
                        <TextInput
                          style={[styles.textInput, { color: theme.textPrimary }]}
                          placeholder={t('farmLocationPlaceholder' as any, 'e.g. Nashik, Maharashtra')}
                          placeholderTextColor={theme.textMuted}
                          value={signupLocation}
                          onChangeText={(t) => {
                            setSignupLocation(t);
                            setErrorMessage(null);
                          }}
                          editable={!loading}
                        />
                      </View>
                    </View>

                    {/* Password / PIN */}
                    <View style={styles.inputGroup}>
                      <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>
                        {t('createPassword' as any, 'Create 4-Digit PIN or Password')}
                      </Text>
                      <View style={[styles.inputWrapper, { backgroundColor: theme.backgroundSubtle, borderColor: theme.border }]}>
                        <Feather name="lock" size={17} color={theme.primary} style={styles.inputIcon} />
                        <TextInput
                          style={[styles.textInput, { color: theme.textPrimary }]}
                          placeholder="Create 4-digit PIN"
                          placeholderTextColor={theme.textMuted}
                          value={signupPassword}
                          onChangeText={(t) => {
                            setSignupPassword(t);
                            setErrorMessage(null);
                          }}
                          secureTextEntry={!showPassword}
                          editable={!loading}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                          <Feather name={showPassword ? 'eye-off' : 'eye'} size={16} color={theme.textMuted} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Auto-Generated Chamber ID Preview Badge */}
                    <View style={[styles.generatedIdBadge, { backgroundColor: theme.primaryLight, borderColor: theme.primary }]}>
                      <MaterialCommunityIcons name="barcode-scan" size={18} color={theme.primary} />
                      <View style={styles.idBadgeTextContainer}>
                        <Text style={[styles.idBadgeTitle, { color: theme.primaryDark }]}>
                          {t('autoGeneratedId' as any, 'Auto-Generated Chamber ID')}
                        </Text>
                        <Text style={[styles.idBadgeCode, { color: theme.primaryDark }]}>
                          {previewStorageId} (Nashik Mesh)
                        </Text>
                      </View>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                      style={[styles.submitButton, loading && { opacity: 0.7 }]}
                      onPress={handleSignupSubmit}
                      disabled={loading}
                      activeOpacity={0.85}
                    >
                      <LinearGradient colors={['#10b981', '#059669']} style={styles.btnGradient}>
                        {loading ? (
                          <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                          <Text style={styles.submitBtnText}>
                            {t('signUpBtn' as any, 'Register & Generate Storage ID 🚀')}
                          </Text>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )}
              </Animated.View>
            </Animated.View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* 12-Language Selector Modal */}
      <LanguageSelectorModal
        visible={isLangModalOpen}
        onClose={() => setIsLangModalOpen(false)}
      />

      {/* Realistic SMS / OTP Verification Dialog */}
      {showOtpModal && (
        <View style={styles.otpModalOverlay}>
          <View style={[styles.otpModalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.smsAlertHeader}>
              <MaterialCommunityIcons name="message-text-lock" size={24} color="#10b981" />
              <View style={styles.smsHeaderInfo}>
                <Text style={[styles.smsTitle, { color: theme.textPrimary }]}>OJAS Mobile SMS OTP Verification</Text>
                <Text style={[styles.smsSubtitle, { color: theme.textMuted }]}>
                  {t('otpSentToPhone' as any, 'Verification OTP & Storage ID sent to')}: +91 {signupMobile}
                </Text>
              </View>
            </View>

            {/* Simulated Live SMS Notification Banner */}
            <View style={[styles.smsPreviewBanner, { backgroundColor: theme.backgroundSubtle, borderColor: theme.border }]}>
              <View style={styles.smsTopRow}>
                <Text style={styles.smsSender}>📲 SMS: GOV-OJAS</Text>
                <Text style={styles.smsTime}>Just now</Text>
              </View>
              <Text style={[styles.smsMessageBody, { color: theme.textPrimary }]}>
                "Welcome to OJAS! Your Solar Cold Storage Chamber ID is{' '}
                <Text style={styles.highlightText}>{previewStorageId}</Text>. Your verification OTP code is{' '}
                <Text style={styles.highlightText}>{expectedOtp}</Text>."
              </Text>
            </View>

            <Text style={[styles.otpInputLabel, { color: theme.textPrimary }]}>
              Enter Verification OTP Code:
            </Text>

            <View style={[styles.otpInputRow, { backgroundColor: theme.backgroundSubtle, borderColor: theme.border }]}>
              <TextInput
                style={[styles.otpTextInput, { color: theme.textPrimary }]}
                placeholder="4-digit OTP"
                placeholderTextColor={theme.textMuted}
                keyboardType="number-pad"
                maxLength={4}
                value={otpCode}
                onChangeText={(t) => setOtpCode(t)}
                autoFocus
              />
              <TouchableOpacity
                style={styles.autoFillBtn}
                onPress={() => setOtpCode(expectedOtp)}
                activeOpacity={0.7}
              >
                <Text style={styles.autoFillText}>Auto-fill</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.otpModalActions}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: theme.border }]}
                onPress={() => setShowOtpModal(false)}
              >
                <Text style={[styles.cancelBtnText, { color: theme.textMuted }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.verifyBtn}
                onPress={handleVerifyOtpAndComplete}
                activeOpacity={0.85}
              >
                <LinearGradient colors={['#10b981', '#059669']} style={styles.btnGradient}>
                  <Text style={styles.verifyBtnText}>Verify & Activate Chamber ✓</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'ios' ? 44 : 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    flexWrap: 'nowrap',
    minHeight: 48,
  },
  topBarBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  topBarLogo: {
    width: 28,
    height: 28,
    borderRadius: 7,
  },
  topBarBrandTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
    flexWrap: 'nowrap',
  },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    flexShrink: 0,
  },
  langBtnText: {
    fontSize: 10,
    fontWeight: '800',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 12,
  },
  authCardWrapper: {
    alignSelf: 'center',
  },
  splitCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  heroColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    zIndex: 2,
  },
  desktopHeroColumn: {
    minHeight: 540,
    padding: 24,
    width: 370,
  },
  mobileHeroColumn: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    width: '100%',
  },
  heroAura: {
    position: 'absolute',
    borderRadius: 130,
    opacity: 0.35,
  },
  desktopHeroAura: {
    width: 260,
    height: 260,
  },
  mobileHeroAura: {
    width: 160,
    height: 160,
  },
  heroAuraGradient: {
    flex: 1,
    borderRadius: 130,
  },
  logoCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10b981',
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 12,
  },
  heroLogoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 52,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 2,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(5, 41, 26, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    marginVertical: 6,
  },
  heroBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#34d399',
    letterSpacing: 0.8,
  },
  heroTagline: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fbbf24',
    textAlign: 'center',
    marginTop: 4,
  },
  heroSubTagline: {
    fontSize: 10,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 2,
  },
  featurePillsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 14,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  featurePillText: {
    fontSize: 9,
    color: '#e2e8f0',
    fontWeight: '700',
  },
  mobileHeroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  mobileLogoImage: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  mobileHeroText: {
    flex: 1,
  },
  mobileTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mobileHeroTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1,
  },
  mobileHeroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(5, 41, 26, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  mobileHeroBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#34d399',
  },
  mobileHeroSubText: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
  },
  formColumn: {
    padding: IS_DESKTOP ? 24 : 16,
    justifyContent: 'center',
    zIndex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    marginBottom: 14,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 11.5,
    fontWeight: '700',
    flex: 1,
  },
  formHeading: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  formSubHeading: {
    fontSize: 11.5,
    marginTop: 2,
    marginBottom: 14,
    lineHeight: 16,
  },
  formFields: {
    gap: 10,
  },
  inputGroup: {
    gap: 3,
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 42,
  },
  inputIcon: {
    marginRight: 8,
  },
  prefixPhone: {
    fontSize: 13,
    fontWeight: '700',
    marginRight: 6,
  },
  textInput: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '600',
    height: '100%',
  },
  eyeBtn: {
    padding: 4,
  },
  generatedIdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 9,
    borderRadius: 12,
    borderWidth: 1,
  },
  idBadgeTextContainer: {
    flex: 1,
  },
  idBadgeTitle: {
    fontSize: 10,
    fontWeight: '700',
  },
  idBadgeCode: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 6,
  },
  btnGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 13.5,
    fontWeight: '800',
  },
  demoSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  demoTitle: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  demoChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  demoChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  demoChipText: {
    fontSize: 10,
    fontWeight: '600',
  },
  otpModalOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    zIndex: 9999,
  },
  otpModalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  smsAlertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  smsHeaderInfo: {
    flex: 1,
  },
  smsTitle: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  smsSubtitle: {
    fontSize: 10.5,
    marginTop: 1,
  },
  smsPreviewBanner: {
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    marginBottom: 14,
  },
  smsTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  smsSender: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#10b981',
  },
  smsTime: {
    fontSize: 9,
    color: '#64748b',
  },
  smsMessageBody: {
    fontSize: 11.5,
    lineHeight: 16,
    fontWeight: '500',
  },
  highlightText: {
    fontWeight: '900',
    color: '#10b981',
  },
  otpInputLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    marginBottom: 6,
  },
  otpInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 14,
  },
  otpTextInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 4,
  },
  autoFillBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  autoFillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10b981',
  },
  otpModalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 10,
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  verifyBtn: {
    flex: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  verifyBtnText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '800',
  },
});
