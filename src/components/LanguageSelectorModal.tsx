import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';
import { INDIAN_LANGUAGES } from '../i18n/translations';
import { LanguageCode } from '../types/user';

interface LanguageSelectorModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function LanguageSelectorModal({ visible, onClose }: LanguageSelectorModalProps) {
  const { theme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const handleSelect = (code: LanguageCode) => {
    setLanguage(code);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              {/* Header */}
              <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
                <View style={styles.titleRow}>
                  <View style={[styles.iconCircle, { backgroundColor: theme.primaryLight }]}>
                    <MaterialCommunityIcons name="translate" size={20} color={theme.primary} />
                  </View>
                  <View>
                    <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                      {t('languageSelect')}
                    </Text>
                    <Text style={[styles.modalSubtitle, { color: theme.textMuted }]}>
                      12 Major Indian Languages (Powered by Gemini AI)
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.backgroundSubtle }]}>
                  <Feather name="x" size={18} color={theme.textPrimary} />
                </TouchableOpacity>
              </View>

              {/* Languages List */}
              <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={false}>
                <View style={styles.gridContainer}>
                  {INDIAN_LANGUAGES.map((item) => {
                    const isSelected = language === item.code;
                    return (
                      <TouchableOpacity
                        key={item.code}
                        style={[
                          styles.langCard,
                          { backgroundColor: theme.backgroundSubtle, borderColor: theme.border },
                          isSelected && {
                            borderColor: theme.primary,
                            backgroundColor: theme.primaryLight,
                          },
                        ]}
                        onPress={() => handleSelect(item.code)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.langTopRow}>
                          <Text style={styles.flagEmoji}>{item.flag}</Text>
                          {isSelected && (
                            <View style={[styles.checkBadge, { backgroundColor: theme.primary }]}>
                              <Feather name="check" size={12} color="#ffffff" />
                            </View>
                          )}
                        </View>
                        <Text style={[styles.nativeName, { color: theme.textPrimary }, isSelected && { color: theme.primary, fontWeight: '800' }]}>
                          {item.nativeName}
                        </Text>
                        <Text style={[styles.langLabel, { color: theme.textMuted }]}>
                          {item.label}
                        </Text>
                        <Text style={[styles.regionTag, { color: isSelected ? theme.primary : theme.textSecondary }]}>
                          {item.region}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>

              {/* Footer Tip */}
              <View style={[styles.footerNotice, { backgroundColor: theme.backgroundSubtle }]}>
                <MaterialCommunityIcons name="creation" size={16} color={theme.primary} />
                <Text style={[styles.footerNoticeText, { color: theme.textSecondary }]}>
                  All chamber telemetry, crop freshness, and AI queries adapt to your chosen language.
                </Text>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '85%',
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  modalSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollList: {
    padding: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  langCard: {
    width: '48%',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  langTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  flagEmoji: {
    fontSize: 20,
  },
  checkBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nativeName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  langLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  regionTag: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 6,
  },
  footerNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  footerNoticeText: {
    fontSize: 11,
    fontWeight: '500',
    flex: 1,
  },
});
