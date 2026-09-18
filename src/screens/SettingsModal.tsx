import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { LanguageCode } from '../types/user';
import ThemeSelector from '../components/ThemeSelector';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  language: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  tempUnit: '°C' | '°F';
  onToggleTempUnit: () => void;
  notificationsEnabled: boolean;
  onToggleNotifications: () => void;
  isDemoActive: boolean;
  onToggleDemoMode: () => void;
}

export default function SettingsModal({
  visible,
  onClose,
  language,
  onSelectLanguage,
  tempUnit,
  onToggleTempUnit,
  notificationsEnabled,
  onToggleNotifications,
  isDemoActive,
  onToggleDemoMode,
}: SettingsModalProps) {
  const { theme } = useTheme();

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.modalOverlay, { backgroundColor: theme.modalOverlay }]}>
        <View style={[styles.sheetCard, { backgroundColor: theme.card }]}>
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>Application Settings</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Theme Selector (LIGHT / DARK / MILD) */}
            <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>Theme Mode / थीम मोड</Text>
            <ThemeSelector language={language} compact={false} />

            {/* Language Selector */}
            <Text style={[styles.sectionHeader, { color: theme.textSecondary, marginTop: 12 }]}>Language / भाषा</Text>
            <View style={styles.langGrid}>
              {[
                { id: 'en' as const, label: 'English (EN)' },
                { id: 'hi' as const, label: 'हिंदी (Hindi)' },
                { id: 'hinglish' as const, label: 'Hinglish' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.langOption,
                    { backgroundColor: theme.backgroundSubtle, borderColor: theme.border },
                    language === item.id && { backgroundColor: theme.primaryLight, borderColor: theme.primary },
                  ]}
                  onPress={() => onSelectLanguage(item.id)}
                >
                  <Text
                    style={[
                      styles.langOptionText,
                      { color: theme.textSecondary },
                      language === item.id && { color: theme.primaryDark, fontWeight: '800' },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Temperature Unit */}
            <View style={styles.settingRow}>
              <View>
                <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>Temperature Unit</Text>
                <Text style={[styles.settingDesc, { color: theme.textMuted }]}>Currently displaying {tempUnit}</Text>
              </View>
              <TouchableOpacity
                onPress={onToggleTempUnit}
                style={[styles.unitToggleBtn, { backgroundColor: theme.primaryLight, borderColor: theme.primary }]}
              >
                <Text style={[styles.unitToggleText, { color: theme.primaryDark }]}>{tempUnit}</Text>
              </TouchableOpacity>
            </View>

            {/* Push Notifications */}
            <View style={styles.settingRow}>
              <View>
                <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>Push Notifications</Text>
                <Text style={[styles.settingDesc, { color: theme.textMuted }]}>Receive critical temperature & battery alerts</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={onToggleNotifications}
                trackColor={{ false: theme.borderDark, true: theme.primary }}
              />
            </View>

            {/* Judge Demo Mode Toggle */}
            <View style={[styles.settingRow, styles.demoRow, { backgroundColor: theme.primaryLight }]}>
              <View>
                <Text style={[styles.settingTitle, { color: theme.primaryDark }]}>Judge Presentation Demo</Text>
                <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>10-Step automated evaluation</Text>
              </View>
              <Switch
                value={isDemoActive}
                onValueChange={onToggleDemoMode}
                trackColor={{ false: theme.borderDark, true: theme.primary }}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    maxHeight: 520,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  langGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  langOption: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  langOptionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  demoRow: {
    padding: 12,
    borderRadius: 14,
    marginTop: 8,
    marginBottom: 12,
  },
  settingTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  settingDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  unitToggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  unitToggleText: {
    fontSize: 13,
    fontWeight: '800',
  },
});
