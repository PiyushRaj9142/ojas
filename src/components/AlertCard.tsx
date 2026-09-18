import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';
import { StorageAlert } from '../types/alert';

interface AlertCardProps {
  alert: StorageAlert;
  onPress?: () => void;
}

export default function AlertCard({ alert, onPress }: AlertCardProps) {
  const { theme } = useTheme();
  const { language, t } = useLanguage();

  let iconName: keyof typeof MaterialCommunityIcons.glyphMap = 'information';
  let iconColor = theme.info;
  let bgBadge = theme.infoLight;

  if (alert.severity === 'CRITICAL') {
    iconName = 'alert-circle';
    iconColor = theme.danger;
    bgBadge = theme.dangerLight;
  } else if (alert.severity === 'WARNING') {
    iconName = 'alert';
    iconColor = theme.warning;
    bgBadge = theme.warningLight;
  }

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.border },
        !alert.read && [styles.unreadCard, { borderLeftColor: theme.primary }],
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.topRow}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconCircle, { backgroundColor: bgBadge }]}>
            <MaterialCommunityIcons name={iconName} size={18} color={iconColor} />
          </View>
          <View style={styles.titleBlock}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>{alert.title}</Text>
            <Text style={[styles.timestamp, { color: theme.textMuted }]}>{alert.timestamp}</Text>
          </View>
        </View>

        {!alert.read && <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />}
      </View>

      <Text style={[styles.description, { color: theme.textSecondary }]}>{alert.description}</Text>

      {alert.actionRequired && (
        <View style={[styles.actionPill, { backgroundColor: theme.primaryLight }]}>
          <Text style={[styles.actionText, { color: theme.primaryDark }]}>{t('actionPrefix', 'Action')}: {alert.actionRequired}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 10,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    backgroundColor: '#ffffff',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  timestamp: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  description: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  actionPill: {
    backgroundColor: colors.warningLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  actionText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.warning,
  },
});
