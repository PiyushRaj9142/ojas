import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';
import { UserProfile, LanguageCode } from '../types/user';
import SettingsModal from './SettingsModal';

interface ProfileScreenProps {
  user: UserProfile;
  onUpdateLanguage: (lang: LanguageCode) => void;
  onToggleTempUnit: () => void;
  onToggleNotifications: () => void;
  isDemoActive: boolean;
  onToggleDemoMode: () => void;
  onLogout: () => void;
}

export default function ProfileScreen({
  user,
  onUpdateLanguage,
  onToggleTempUnit,
  onToggleNotifications,
  isDemoActive,
  onToggleDemoMode,
  onLogout,
}: ProfileScreenProps) {
  const { theme, themeMode } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSupportCall = () => {
    Alert.alert(
      t('agroHotline', 'Kisan Agri Support'),
      'Contact Smart Cold Storage 24x7 Agro Hotline at 1800-180-1551?'
    );
  };

  const getInitials = (name: string) => {
    const parts = (name || 'Kisan').trim().split(' ');
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return (name?.[0] || 'K').toUpperCase();
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Farmer Identity Card */}
      <View style={[styles.profileCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={[styles.avatarCircle, { backgroundColor: theme.primary }]}>
          <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
        </View>

        <Text style={[styles.farmerName, { color: theme.textPrimary }]}>{user.name}</Text>
        <Text style={[styles.farmerMobile, { color: theme.textMuted }]}>+91 {user.mobile}</Text>

        <View style={[styles.farmPill, { backgroundColor: theme.primaryLight }]}>
          <MaterialCommunityIcons name="sprout" size={14} color={theme.primary} />
          <Text style={[styles.farmText, { color: theme.primaryDark }]}>{user.farmName}</Text>
        </View>
      </View>

      {/* 2. Cold Storage Unit Identity */}
      <View style={[styles.storageCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.cardHeaderTitle, { color: theme.textPrimary }]}>{t('storageSpecs', 'Cold Storage Specifications')}</Text>

        <View style={styles.storageGrid}>
          <View style={[styles.specRow, { backgroundColor: theme.backgroundSubtle }]}>
            <Text style={[styles.specLabel, { color: theme.textMuted }]}>{t('storageId', 'Storage ID')}</Text>
            <Text style={[styles.specValue, { color: theme.textPrimary }]}>{user.coldStorageId}</Text>
          </View>

          <View style={[styles.specRow, { backgroundColor: theme.backgroundSubtle }]}>
            <Text style={[styles.specLabel, { color: theme.textMuted }]}>{t('farmLocation', 'Farm Location')}</Text>
            <Text style={[styles.specValue, { color: theme.textPrimary }]}>{user.location}</Text>
          </View>

          <View style={[styles.specRow, { backgroundColor: theme.backgroundSubtle }]}>
            <Text style={[styles.specLabel, { color: theme.textMuted }]}>{t('totalCapacity', 'Total Capacity')}</Text>
            <Text style={[styles.specValue, { color: theme.textPrimary }]}>{user.totalCapacityKg} kg</Text>
          </View>

          <View style={[styles.specRow, { backgroundColor: theme.backgroundSubtle }]}>
            <Text style={[styles.specLabel, { color: theme.textMuted }]}>{t('generationLink', 'Generation Link')}</Text>
            <Text style={[styles.specValue, { color: theme.secondary }]}>{t('vawtLiFePO4', 'VAWT Wind + LiFePO4')}</Text>
          </View>
        </View>
      </View>

      {/* 3. Settings & Preferences Menu */}
      <View style={[styles.menuCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.menuItem, { borderBottomColor: theme.borderLight }]}
          onPress={() => setIsSettingsOpen(true)}
          activeOpacity={0.7}
        >
          <View style={styles.menuLeft}>
            <View style={[styles.menuIcon, { backgroundColor: theme.primaryLight }]}>
              <Feather name="globe" size={16} color={theme.primary} />
            </View>
            <Text style={[styles.menuLabel, { color: theme.textPrimary }]}>{t('languageSelect', 'Language / भाषा')}</Text>
          </View>
          <View style={styles.menuRight}>
            <Text style={[styles.menuValText, { color: theme.textMuted }]}>{language.toUpperCase()}</Text>
            <Feather name="chevron-right" size={16} color={theme.textMuted} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { borderBottomColor: theme.borderLight }]}
          onPress={() => setIsSettingsOpen(true)}
          activeOpacity={0.7}
        >
          <View style={styles.menuLeft}>
            <View style={[styles.menuIcon, { backgroundColor: theme.secondaryLight }]}>
              <Feather name="moon" size={16} color={theme.secondary} />
            </View>
            <Text style={[styles.menuLabel, { color: theme.textPrimary }]}>{t('themeMode', 'Theme Mode')}</Text>
          </View>
          <View style={styles.menuRight}>
            <Text style={[styles.menuValText, { color: theme.textMuted }]}>{themeMode}</Text>
            <Feather name="chevron-right" size={16} color={theme.textMuted} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { borderBottomColor: theme.borderLight }]}
          onPress={() => setIsSettingsOpen(true)}
          activeOpacity={0.7}
        >
          <View style={styles.menuLeft}>
            <View style={[styles.menuIcon, { backgroundColor: theme.primaryLight }]}>
              <Feather name="sliders" size={16} color={theme.primary} />
            </View>
            <Text style={[styles.menuLabel, { color: theme.textPrimary }]}>{t('unitsParams', 'Units & Parameters')}</Text>
          </View>
          <View style={styles.menuRight}>
            <Text style={[styles.menuValText, { color: theme.textMuted }]}>{user.tempUnit} • {user.weightUnit}</Text>
            <Feather name="chevron-right" size={16} color={theme.textMuted} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { borderBottomColor: theme.borderLight }]}
          onPress={handleSupportCall}
          activeOpacity={0.7}
        >
          <View style={styles.menuLeft}>
            <View style={[styles.menuIcon, { backgroundColor: theme.primaryLight }]}>
              <Feather name="phone-call" size={16} color={theme.primary} />
            </View>
            <Text style={[styles.menuLabel, { color: theme.textPrimary }]}>{t('supportHelp', 'Kisan Help & Support')}</Text>
          </View>
          <Feather name="chevron-right" size={16} color={theme.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { borderBottomWidth: 0 }]}
          onPress={() => Alert.alert(t('aboutAppDialogTitle', 'About Smart Cold Storage'), t('aboutAppDialogDesc', 'Version 2.4.1 (Hybrid Off-Grid SIH Edition)\nDesigned for smallholder farmer cold-chain preservation.'))}
          activeOpacity={0.7}
        >
          <View style={styles.menuLeft}>
            <View style={[styles.menuIcon, { backgroundColor: theme.backgroundSubtle }]}>
              <Feather name="info" size={16} color={theme.textSecondary} />
            </View>
            <Text style={[styles.menuLabel, { color: theme.textPrimary }]}>{t('aboutApp', 'About App')}</Text>
          </View>
          <Text style={[styles.menuValText, { color: theme.textMuted }]}>v2.4.1</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: theme.dangerLight }]} onPress={onLogout} activeOpacity={0.8}>
        <Feather name="log-out" size={16} color={theme.danger} />
        <Text style={[styles.logoutText, { color: theme.danger }]}>{t('logoutAccount', 'Logout from Account')}</Text>
      </TouchableOpacity>

      {/* Settings Modal */}
      <SettingsModal
        visible={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        language={user.language}
        onSelectLanguage={onUpdateLanguage}
        tempUnit={user.tempUnit}
        onToggleTempUnit={onToggleTempUnit}
        notificationsEnabled={user.notificationsEnabled}
        onToggleNotifications={onToggleNotifications}
        isDemoActive={isDemoActive}
        onToggleDemoMode={onToggleDemoMode}
      />
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
  profileCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
  },
  farmerName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  farmerMobile: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  farmPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 10,
  },
  farmText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  storageCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  cardHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  storageGrid: {
    gap: 8,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundSubtle,
    padding: 10,
    borderRadius: 10,
  },
  specLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  specValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  menuCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  menuValText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.dangerLight,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 20,
  },
  logoutText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '800',
  },
});
