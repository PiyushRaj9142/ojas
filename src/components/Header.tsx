import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  useWindowDimensions,
  Animated,
  Easing,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';
import { INDIAN_LANGUAGES } from '../i18n/translations';
import { LanguageCode } from '../types/user';

import ThemeSwitcher from './ThemeSwitcher';
import NotificationBell from './NotificationBell';
import LanguageSelectorModal from './LanguageSelectorModal';
import NavDrawer from './NavDrawer';

interface HeaderProps {
  storageId?: string;
  isOnline: boolean;
  onToggleOnline?: () => void;
  language?: LanguageCode;
  onCycleLanguage?: () => void;
  unreadAlertsCount?: number;
  onPressAlerts?: () => void;
  onPressSettings?: () => void;
  activeScreen?: string;
  onNavigate?: (screen: string) => void;
  userName?: string;
}

export default function Header({
  storageId = 'SC-001',
  isOnline,
  onToggleOnline,
  language: propLanguage,
  onCycleLanguage: propOnCycleLanguage,
  unreadAlertsCount = 0,
  onPressAlerts,
  onPressSettings,
  activeScreen = 'HOME',
  onNavigate,
  userName = 'Farmer',
}: HeaderProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const { theme } = useTheme();
  const { language: ctxLanguage, cycleLanguage, t } = useLanguage();
  const language = propLanguage || ctxLanguage;
  const onCycleLanguage = propOnCycleLanguage || cycleLanguage;

  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // 5-Second Welcome Alert Banner State
  const [showWelcomeToast, setShowWelcomeToast] = useState(true);
  const toastProgressAnim = useRef(new Animated.Value(1)).current;
  const toastFadeAnim = useRef(new Animated.Value(1)).current;

  const activeLangOption = INDIAN_LANGUAGES.find((l) => l.code === language) || INDIAN_LANGUAGES[0];

  // Extract clean first name or display name
  const cleanName = (userName || 'Farmer').trim();
  const firstName = cleanName.split(' ')[0] || cleanName;

  // Dynamic time-based greeting with personalized name
  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    let prefix = 'Good Morning';
    let icon = '☀️';

    if (hour >= 12 && hour < 17) {
      prefix = 'Good Afternoon';
      icon = '🌤️';
    } else if (hour >= 17 && hour < 22) {
      prefix = 'Good Evening';
      icon = '🌆';
    } else if (hour >= 22 || hour < 4) {
      prefix = 'Good Night';
      icon = '🌙';
    }

    if (language === 'hi') {
      if (hour >= 4 && hour < 12) return `सुप्रभात, ${firstName} ${icon}`;
      if (hour >= 12 && hour < 17) return `शुभ दोपहर, ${firstName} ${icon}`;
      if (hour >= 17 && hour < 22) return `शुभ संध्या, ${firstName} ${icon}`;
      return `शुभ रात्रि, ${firstName} ${icon}`;
    }

    if (language === 'mr') {
      if (hour >= 4 && hour < 12) return `शुभ सकाळ, ${firstName} ${icon}`;
      if (hour >= 12 && hour < 17) return `शुभ दुपार, ${firstName} ${icon}`;
      if (hour >= 17 && hour < 22) return `शुभ संध्याकाळ, ${firstName} ${icon}`;
      return `शुभ रात्री, ${firstName} ${icon}`;
    }

    if (language === 'bn') {
      if (hour >= 4 && hour < 12) return `সুপ্রভাত, ${firstName} ${icon}`;
      if (hour >= 12 && hour < 17) return `শুভ অপরাহ্ন, ${firstName} ${icon}`;
      if (hour >= 17 && hour < 22) return `শুভ সন্ধ্যা, ${firstName} ${icon}`;
      return `শুভ রাত্রি, ${firstName} ${icon}`;
    }

    if (language === 'te') {
      if (hour >= 4 && hour < 12) return `శుభోదయం, ${firstName} ${icon}`;
      if (hour >= 12 && hour < 17) return `శుభ మధ్యాహ్నం, ${firstName} ${icon}`;
      if (hour >= 17 && hour < 22) return `శుభ సాయంత్రం, ${firstName} ${icon}`;
      return `శుభరాత్రి, ${firstName} ${icon}`;
    }

    if (language === 'ta') {
      if (hour >= 4 && hour < 12) return `காலை வணக்கம், ${firstName} ${icon}`;
      if (hour >= 12 && hour < 17) return `மதிய வணக்கம், ${firstName} ${icon}`;
      if (hour >= 17 && hour < 22) return `மாலை வணக்கம், ${firstName} ${icon}`;
      return `இனிய இரவு, ${firstName} ${icon}`;
    }

    if (language === 'gu') {
      if (hour >= 4 && hour < 12) return `શુભ સવાર, ${firstName} ${icon}`;
      if (hour >= 12 && hour < 17) return `શુભ બપોર, ${firstName} ${icon}`;
      if (hour >= 17 && hour < 22) return `શુભ સાંજ, ${firstName} ${icon}`;
      return `શુભ રાત્રિ, ${firstName} ${icon}`;
    }

    if (language === 'kn') {
      if (hour >= 4 && hour < 12) return `ಶುಭೋದಯ, ${firstName} ${icon}`;
      if (hour >= 12 && hour < 17) return `ಶುಭ ಮಧ್ಯಾಹ್ನ, ${firstName} ${icon}`;
      if (hour >= 17 && hour < 22) return `ಶುಭ ಸಂಜೆ, ${firstName} ${icon}`;
      return `ಶುಭ ರಾತ್ರಿ, ${firstName} ${icon}`;
    }

    if (language === 'ml') {
      if (hour >= 4 && hour < 12) return `സുപ്രഭാതം, ${firstName} ${icon}`;
      if (hour >= 12 && hour < 17) return `ശുഭ ഉച്ചതിരിഞ്ഞ്, ${firstName} ${icon}`;
      if (hour >= 17 && hour < 22) return `ശുഭ സായാഹ്നം, ${firstName} ${icon}`;
      return `ശുഭ രാത്രി, ${firstName} ${icon}`;
    }

    if (language === 'pa') {
      if (hour >= 4 && hour < 12) return `ਸ਼ੁਭ ਸਵੇਰ, ${firstName} ${icon}`;
      if (hour >= 12 && hour < 17) return `ਸ਼ੁਭ ਦੁਪਹਿਰ, ${firstName} ${icon}`;
      if (hour >= 17 && hour < 22) return `ਸ਼ੁਭ ਸ਼ਾਮ, ${firstName} ${icon}`;
      return `ਸ਼ੁਭ ਰਾਤ, ${firstName} ${icon}`;
    }

    if (language === 'or') {
      if (hour >= 4 && hour < 12) return `ଶୁଭ ସକାଳ, ${firstName} ${icon}`;
      if (hour >= 12 && hour < 17) return `ଶୁଭ ଅପରାହ୍ନ, ${firstName} ${icon}`;
      if (hour >= 17 && hour < 22) return `ଶୁଭ ସନ୍ଧ୍ୟା, ${firstName} ${icon}`;
      return `ଶୁଭ ରାତ୍ରି, ${firstName} ${icon}`;
    }

    return `${prefix}, ${firstName} ${icon}`;
  };

  // 5-Second Toast Auto-Dismiss Timer
  useEffect(() => {
    setShowWelcomeToast(true);
    toastProgressAnim.setValue(1);
    toastFadeAnim.setValue(1);

    // 5-second countdown progress bar animation
    Animated.timing(toastProgressAnim, {
      toValue: 0,
      duration: 5000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();

    // Auto dismiss after 5s
    const timer = setTimeout(() => {
      dismissToast();
    }, 5000);

    return () => clearTimeout(timer);
  }, [userName]);

  const dismissToast = () => {
    Animated.timing(toastFadeAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setShowWelcomeToast(false);
    });
  };

  const handleDrawerNavigate = (screen: string) => {
    if (onNavigate) {
      onNavigate(screen);
    }
  };

  const toastProgressWidth = toastProgressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.headerWrapper, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
      {/* Top Navbar Row */}
      <View style={styles.topRow}>
        {/* Left Side: Hamburger Menu + Logo & Title */}
        <View style={styles.leftSection}>
          <TouchableOpacity
            style={[styles.hamburgerBtn, { backgroundColor: theme.backgroundSubtle, borderColor: theme.border }]}
            onPress={() => setIsDrawerOpen(true)}
            activeOpacity={0.7}
            accessibilityLabel="Open Navigation Menu"
          >
            <Feather name="menu" size={18} color={theme.textPrimary} />
            {unreadAlertsCount > 0 && (
              <View style={[styles.menuAlertDot, { backgroundColor: theme.danger }]} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoTouch}
            onPress={() => handleDrawerNavigate('HOME')}
            activeOpacity={0.8}
          >
            <Image
              source={require('../../assets/logo.png')}
              style={styles.headerLogo}
              resizeMode="cover"
            />
            <Text style={[styles.brandTitle, { color: theme.textPrimary }]} numberOfLines={1}>
              OJAS
            </Text>
          </TouchableOpacity>

          {/* Desktop Only: Personalized Greeting & Storage ID */}
          {isDesktop && (
            <View style={styles.desktopFarmerInfo}>
              <Text style={[styles.desktopGreeting, { color: theme.textPrimary }]}>
                {getTimeGreeting()}
              </Text>
              <View style={styles.desktopMetaRow}>
                <Text style={[styles.storageIdText, { color: theme.textMuted }]}>
                  {t('storageId' as any, 'Storage')}:{' '}
                  <Text style={[styles.storageIdBold, { color: theme.textPrimary }]}>{storageId}</Text>
                </Text>
                <TouchableOpacity
                  style={[
                    styles.statusPill,
                    isOnline ? { backgroundColor: theme.successLight } : { backgroundColor: theme.dangerLight },
                  ]}
                  onPress={onToggleOnline}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.statusDot,
                      isOnline ? { backgroundColor: theme.success } : { backgroundColor: theme.danger },
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      isOnline ? { color: theme.success } : { color: theme.danger },
                    ]}
                  >
                    {isOnline ? t('statusOnline' as any, 'ONLINE') : t('statusOffline' as any, 'OFFLINE')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Right Side: Quick Action Controls */}
        <View style={styles.actionsRow}>
          {/* Mobile Online Pill */}
          {!isDesktop && (
            <TouchableOpacity
              style={[
                styles.mobileStatusPill,
                isOnline ? { backgroundColor: theme.successLight } : { backgroundColor: theme.dangerLight },
              ]}
              onPress={onToggleOnline}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.statusDot,
                  isOnline ? { backgroundColor: theme.success } : { backgroundColor: theme.danger },
                ]}
              />
              <Text
                style={[
                  styles.mobileStatusText,
                  isOnline ? { color: theme.success } : { color: theme.danger },
                ]}
              >
                {storageId}
              </Text>
            </TouchableOpacity>
          )}

          {/* Top Corner Notification Bell */}
          <NotificationBell
            language={language}
            onViewAllAlerts={onPressAlerts}
          />

          {/* Theme Switcher */}
          <ThemeSwitcher language={language} />

          {/* 12-Language Selector Button */}
          <TouchableOpacity
            style={[styles.langBtn, { backgroundColor: theme.backgroundSubtle, borderColor: theme.border }]}
            onPress={() => setIsLangModalOpen(true)}
            activeOpacity={0.8}
          >
            <Text style={[styles.langText, { color: theme.textPrimary }]}>
              {activeLangOption.flag} {activeLangOption.code.toUpperCase()}
            </Text>
          </TouchableOpacity>

          {/* Settings Gear (Desktop) */}
          {isDesktop && onPressSettings && (
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: theme.backgroundSubtle, borderColor: theme.border }]}
              onPress={onPressSettings}
              activeOpacity={0.7}
            >
              <Feather name="settings" size={16} color={theme.textPrimary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 5-Second Welcome Toast Alert Banner with Auto-Dismiss Progress & Cross Icon */}
      {showWelcomeToast && (
        <Animated.View
          style={[
            styles.welcomeToast,
            {
              backgroundColor: theme.primaryLight,
              borderColor: theme.primary,
              opacity: toastFadeAnim,
            },
          ]}
        >
          <View style={styles.toastContent}>
            <MaterialCommunityIcons name="shield-sun" size={16} color={theme.primary} />
            <Text style={[styles.toastText, { color: theme.primaryDark }]} numberOfLines={1}>
              {getTimeGreeting()} • {t('storageId' as any, 'Chamber')}: <Text style={{ fontWeight: '900' }}>{storageId}</Text> {isOnline ? '🟢 Live' : '🔴 Offline'}
            </Text>
            <TouchableOpacity onPress={dismissToast} style={styles.toastCloseBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Feather name="x" size={14} color={theme.primaryDark} />
            </TouchableOpacity>
          </View>
          {/* Animated 5-second countdown line */}
          <View style={styles.toastProgressBarBg}>
            <Animated.View style={[styles.toastProgressBarFill, { width: toastProgressWidth, backgroundColor: theme.primary }]} />
          </View>
        </Animated.View>
      )}

      {/* 12-Language Modal */}
      <LanguageSelectorModal
        visible={isLangModalOpen}
        onClose={() => setIsLangModalOpen(false)}
      />

      {/* Responsive Slide-Out Navigation Drawer */}
      <NavDrawer
        visible={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeScreen={activeScreen}
        onNavigate={handleDrawerNavigate}
        isOnline={isOnline}
        onToggleOnline={onToggleOnline}
        storageId={storageId}
        unreadAlertsCount={unreadAlertsCount}
        userName={userName}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerWrapper: {
    borderBottomWidth: 1,
    zIndex: 100,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: Platform.OS === 'ios' ? 8 : 8,
    paddingBottom: 8,
    flexWrap: 'nowrap',
    minHeight: 48,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    gap: 6,
  },
  hamburgerBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  menuAlertDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  logoTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 8,
  },
  headerLogo: {
    width: 28,
    height: 28,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  desktopFarmerInfo: {
    marginLeft: 10,
    paddingLeft: 12,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.12)',
  },
  desktopGreeting: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  desktopMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  storageIdText: {
    fontSize: 11,
    fontWeight: '500',
  },
  storageIdBold: {
    fontWeight: '800',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  mobileStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    flexShrink: 0,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  mobileStatusText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
    flexWrap: 'nowrap',
  },
  langBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  langText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  welcomeToast: {
    marginHorizontal: 8,
    marginBottom: 6,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 5,
    gap: 6,
  },
  toastText: {
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
  },
  toastCloseBtn: {
    padding: 2,
  },
  toastProgressBarBg: {
    width: '100%',
    height: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  toastProgressBarFill: {
    height: '100%',
  },
});
