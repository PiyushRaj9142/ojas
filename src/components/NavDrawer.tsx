import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';
import { INDIAN_LANGUAGES } from '../i18n/translations';
import { LanguageCode } from '../types/user';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.85, 360);

interface NavDrawerProps {
  visible: boolean;
  onClose: () => void;
  activeScreen: string;
  onNavigate: (screen: string) => void;
  isOnline: boolean;
  onToggleOnline?: () => void;
  storageId?: string;
  unreadAlertsCount?: number;
  userName?: string;
}

interface NavItem {
  id: string;
  titleKey: string;
  iconName: any;
  iconFamily: 'Feather' | 'MaterialCommunityIcons';
  badge?: number;
  category: 'core' | 'intelligence' | 'system';
  color: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'HOME',
    titleKey: 'tabDashboard',
    iconName: 'view-dashboard-outline',
    iconFamily: 'MaterialCommunityIcons',
    category: 'core',
    color: '#38bdf8',
  },
  {
    id: 'STORAGE',
    titleKey: 'tabColdStorage',
    iconName: 'snowflake',
    iconFamily: 'MaterialCommunityIcons',
    category: 'core',
    color: '#06b6d4',
  },
  {
    id: 'DIGITAL_TWIN',
    titleKey: 'tabDigitalTwin',
    iconName: 'cube-outline',
    iconFamily: 'MaterialCommunityIcons',
    category: 'core',
    color: '#8b5cf6',
  },
  {
    id: 'INVENTORY',
    titleKey: 'tabInventory',
    iconName: 'fruit-cherries',
    iconFamily: 'MaterialCommunityIcons',
    category: 'core',
    color: '#10b981',
  },
  {
    id: 'ENERGY',
    titleKey: 'tabEnergy',
    iconName: 'lightning-bolt',
    iconFamily: 'MaterialCommunityIcons',
    category: 'core',
    color: '#f59e0b',
  },
  {
    id: 'ANALYTICS',
    titleKey: 'tabAnalytics',
    iconName: 'chart-line',
    iconFamily: 'MaterialCommunityIcons',
    category: 'intelligence',
    color: '#6366f1',
  },
  {
    id: 'ALERTS',
    titleKey: 'tabAlerts',
    iconName: 'bell-outline',
    iconFamily: 'MaterialCommunityIcons',
    category: 'intelligence',
    color: '#ef4444',
  },
  {
    id: 'ASSISTANT',
    titleKey: 'tabAssistant',
    iconName: 'robot-outline',
    iconFamily: 'MaterialCommunityIcons',
    category: 'intelligence',
    color: '#ec4899',
  },
  {
    id: 'RECOMMENDATIONS',
    titleKey: 'tabRecommendations',
    iconName: 'lightbulb-outline',
    iconFamily: 'MaterialCommunityIcons',
    category: 'intelligence',
    color: '#f97316',
  },
  {
    id: 'PROFILE',
    titleKey: 'tabProfile',
    iconName: 'user',
    iconFamily: 'Feather',
    category: 'system',
    color: '#10b981',
  },
];

export default function NavDrawer({
  visible,
  onClose,
  activeScreen,
  onNavigate,
  isOnline,
  onToggleOnline,
  storageId = 'SC-001',
  unreadAlertsCount = 0,
  userName = 'Farmer',
}: NavDrawerProps) {
  const { theme, themeMode, setThemeMode } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleItemPress = (screenId: string) => {
    onNavigate(screenId);
    onClose();
  };

  const cleanName = (userName || 'Farmer').trim();
  const firstName = cleanName.split(' ')[0] || cleanName;

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

    return `${prefix}, ${firstName} ${icon}`;
  };

  const getInitials = (name: string) => {
    const parts = (name || 'Kisan').trim().split(' ');
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return (name?.[0] || 'K').toUpperCase();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalRoot}>
        {/* Semi-transparent Backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={onClose}
          />
        </Animated.View>

        {/* Sliding Drawer Content */}
        <Animated.View
          style={[
            styles.drawerContainer,
            {
              width: DRAWER_WIDTH,
              backgroundColor: theme.card,
              borderRightColor: theme.border,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          {/* Brand Header */}
          <View style={[styles.drawerHeader, { borderBottomColor: theme.border }]}>
            <View style={styles.brandRow}>
              <Image
                source={require('../../assets/logo.png')}
                style={styles.logoImage}
                resizeMode="cover"
              />
              <View style={styles.brandInfo}>
                <View style={styles.brandTitleRow}>
                  <Text style={[styles.brandTitle, { color: theme.textPrimary }]}>OJAS</Text>
                  <View style={styles.proBadge}>
                    <Text style={styles.proBadgeText}>HYBRID IoT</Text>
                  </View>
                </View>
                <Text style={[styles.brandSubtitle, { color: theme.textMuted }]}>
                  {t('menuSubtitle' as any, 'Solar Cold Chain SC-001')}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: theme.backgroundSubtle }]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Feather name="x" size={20} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Farmer Profile Pill */}
            <View style={[styles.farmerCard, { backgroundColor: theme.backgroundSubtle, borderColor: theme.border }]}>
              <View style={styles.farmerCardTop}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{getInitials(userName)}</Text>
                </View>
                <View style={styles.farmerDetails}>
                  <Text style={[styles.farmerGreeting, { color: theme.primary }]}>
                    {getTimeGreeting()}
                  </Text>
                  <Text style={[styles.farmerName, { color: theme.textPrimary }]}>
                    {cleanName}
                  </Text>
                  <Text style={[styles.farmLocation, { color: theme.textMuted }]}>
                    Nashik, Maharashtra • {storageId}
                  </Text>
                </View>
              </View>

              <View style={styles.chamberStatusRow}>
                <TouchableOpacity
                  style={[
                    styles.statusIndicator,
                    isOnline ? { backgroundColor: theme.successLight } : { backgroundColor: theme.dangerLight },
                  ]}
                  onPress={onToggleOnline}
                  activeOpacity={0.8}
                >
                  <View style={[styles.statusDot, { backgroundColor: isOnline ? theme.success : theme.danger }]} />
                  <Text style={[styles.statusText, { color: isOnline ? theme.success : theme.danger }]}>
                    {isOnline ? t('chamberStatusOnline' as any, 'Live IoT Online') : t('chamberStatusOffline' as any, 'Chamber Offline')}
                  </Text>
                </TouchableOpacity>

                <View style={styles.capacityBadge}>
                  <MaterialCommunityIcons name="scale" size={12} color={theme.primary} />
                  <Text style={[styles.capacityText, { color: theme.textPrimary }]}>
                    500 kg Cap
                  </Text>
                </View>
              </View>
            </View>

            {/* Navigation List */}
            <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
              {t('allScreens' as any, 'ALL SYSTEM SCREENS')}
            </Text>

            <View style={styles.navList}>
              {NAV_ITEMS.map((item) => {
                const isActive = activeScreen === item.id;
                const badgeCount = item.id === 'ALERTS' ? unreadAlertsCount : 0;

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.navItemRow,
                      { borderColor: 'transparent' },
                      isActive && {
                        backgroundColor: `${item.color}15`,
                        borderColor: item.color,
                      },
                    ]}
                    onPress={() => handleItemPress(item.id)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.navIconBox,
                        { backgroundColor: `${item.color}20` },
                        isActive && { backgroundColor: item.color },
                      ]}
                    >
                      {item.iconFamily === 'Feather' ? (
                        <Feather
                          name={item.iconName}
                          size={18}
                          color={isActive ? '#ffffff' : item.color}
                        />
                      ) : (
                        <MaterialCommunityIcons
                          name={item.iconName}
                          size={18}
                          color={isActive ? '#ffffff' : item.color}
                        />
                      )}
                    </View>

                    <Text
                      style={[
                        styles.navItemLabel,
                        { color: theme.textPrimary },
                        isActive && { fontWeight: '800', color: item.color },
                      ]}
                    >
                      {t(item.titleKey as any, item.id)}
                    </Text>

                    {badgeCount > 0 && (
                      <View style={[styles.alertBadge, { backgroundColor: theme.danger }]}>
                        <Text style={styles.alertBadgeText}>{badgeCount}</Text>
                      </View>
                    )}

                    {isActive && (
                      <Feather name="chevron-right" size={16} color={item.color} style={styles.activeChevron} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Quick Controls Section */}
            <Text style={[styles.sectionTitle, { color: theme.textMuted, marginTop: 20 }]}>
              {t('quickControls' as any, 'QUICK CONTROLS')}
            </Text>

            {/* Visual Theme Selection */}
            <View style={[styles.controlBox, { backgroundColor: theme.backgroundSubtle, borderColor: theme.border }]}>
              <Text style={[styles.controlLabel, { color: theme.textPrimary }]}>
                {t('themeModeTitle' as any, 'Visual Theme')}
              </Text>
              <View style={styles.themeRow}>
                {(['LIGHT', 'MILD', 'DARK'] as const).map((tMode) => {
                  const isSelected = themeMode === tMode;
                  const icons = { LIGHT: 'sun', MILD: 'feather', DARK: 'moon' } as const;
                  const labels = { LIGHT: 'Light', MILD: 'Mild', DARK: 'Dark' };
                  return (
                    <TouchableOpacity
                      key={tMode}
                      style={[
                        styles.themeChip,
                        { borderColor: theme.border, backgroundColor: theme.card },
                        isSelected && { backgroundColor: theme.primary, borderColor: theme.primary },
                      ]}
                      onPress={() => setThemeMode(tMode)}
                      activeOpacity={0.7}
                    >
                      <Feather
                        name={icons[tMode]}
                        size={13}
                        color={isSelected ? '#ffffff' : theme.textPrimary}
                      />
                      <Text
                        style={[
                          styles.themeChipText,
                          { color: theme.textPrimary },
                          isSelected && { color: '#ffffff', fontWeight: '800' },
                        ]}
                      >
                        {labels[tMode]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Language Selector Chips */}
            <View style={[styles.controlBox, { backgroundColor: theme.backgroundSubtle, borderColor: theme.border, marginTop: 10 }]}>
              <Text style={[styles.controlLabel, { color: theme.textPrimary }]}>
                {t('switchLanguage' as any, 'Language / भाषा (12 Indian Languages)')}
              </Text>
              <View style={styles.langGrid}>
                {INDIAN_LANGUAGES.map((langOption) => {
                  const isSelected = language === langOption.code;
                  return (
                    <TouchableOpacity
                      key={langOption.code}
                      style={[
                        styles.langChip,
                        { borderColor: theme.border, backgroundColor: theme.card },
                        isSelected && { backgroundColor: theme.primary, borderColor: theme.primary },
                      ]}
                      onPress={() => setLanguage(langOption.code)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.langFlag}>{langOption.flag}</Text>
                      <Text
                        style={[
                          styles.langChipText,
                          { color: theme.textPrimary },
                          isSelected && { color: '#ffffff', fontWeight: '800' },
                        ]}
                        numberOfLines={1}
                      >
                        {langOption.nativeName.split(' ')[0]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Footer / Hotline */}
            <View style={styles.drawerFooter}>
              <View style={styles.supportRow}>
                <Feather name="phone-call" size={14} color="#10b981" />
                <Text style={[styles.supportText, { color: theme.textMuted }]}>
                  {t('supportHotline' as any, '24/7 Kisan Helpline: 1800-OJAS-AGRI')}
                </Text>
              </View>
              <Text style={[styles.versionText, { color: theme.textMuted }]}>
                OJAS v2.4.1 • Clean Energy • Cooler Harvests
              </Text>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  drawerContainer: {
    flex: 1,
    height: '100%',
    borderRightWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 20,
    zIndex: 999,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 48 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  logoImage: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  brandInfo: {
    flex: 1,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  proBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  proBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#10b981',
  },
  brandSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  farmerCard: {
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  farmerCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  farmerDetails: {
    flex: 1,
  },
  farmerGreeting: {
    fontSize: 11,
    fontWeight: '700',
  },
  farmerName: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 1,
  },
  farmLocation: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 1,
  },
  chamberStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  capacityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  capacityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 8,
    marginLeft: 4,
  },
  navList: {
    gap: 4,
  },
  navItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
  },
  navIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navItemLabel: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  alertBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  alertBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  activeChevron: {
    marginLeft: 4,
  },
  controlBox: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  controlLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  themeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  themeChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  langGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  langChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  langFlag: {
    fontSize: 12,
  },
  langChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  drawerFooter: {
    marginTop: 20,
    marginBottom: 30,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    gap: 4,
  },
  supportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  supportText: {
    fontSize: 11,
    fontWeight: '600',
  },
  versionText: {
    fontSize: 9,
    fontWeight: '500',
  },
});
