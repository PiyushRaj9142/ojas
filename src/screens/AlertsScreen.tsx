import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';
import { StorageAlert, AlertSeverity } from '../types/alert';
import AlertCard from '../components/AlertCard';

interface AlertsScreenProps {
  alerts: StorageAlert[];
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
}

export default function AlertsScreen({
  alerts,
  onMarkAllAsRead,
  onClearAll,
}: AlertsScreenProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [filter, setFilter] = useState<'ALL' | AlertSeverity>('ALL');

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'ALL') return true;
    return a.severity === filter;
  });

  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL').length;
  const warningCount = alerts.filter(a => a.severity === 'WARNING').length;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Actions Bar */}
        <View style={styles.actionsBar}>
          <View style={[styles.badgeCount, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.badgeCountText, { color: theme.textPrimary }]}>{alerts.length} {t('notifications', 'Total Notifications')}</Text>
          </View>

          <View style={styles.actionBtnsRow}>
            <TouchableOpacity onPress={onMarkAllAsRead} style={[styles.actionBtn, { backgroundColor: theme.primaryLight }]}>
              <Feather name="check-square" size={13} color={theme.primary} />
              <Text style={[styles.actionBtnText, { color: theme.primaryDark }]}>{t('markAllRead', 'Read All')}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onClearAll} style={[styles.actionBtn, { backgroundColor: theme.dangerLight }]}>
              <Feather name="trash-2" size={13} color={theme.danger} />
              <Text style={[styles.actionBtnText, { color: theme.danger }]}>{t('clearAll', 'Clear')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Severity Filter Tabs */}
        <View style={styles.filterTabs}>
          {[
            { id: 'ALL' as const, label: t('filterAll', 'All'), count: alerts.length },
            { id: 'CRITICAL' as const, label: t('filterCritical', 'Critical'), count: criticalCount },
            { id: 'WARNING' as const, label: t('filterWarning', 'Warning'), count: warningCount },
            { id: 'INFO' as const, label: t('filterInfo', 'Info'), count: alerts.length - criticalCount - warningCount },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.filterChip,
                { backgroundColor: theme.card, borderColor: theme.border },
                filter === tab.id && { backgroundColor: theme.primaryLight, borderColor: theme.primary },
              ]}
              onPress={() => setFilter(tab.id)}
            >
              <Text style={[
                styles.filterChipText,
                { color: theme.textSecondary },
                filter === tab.id && { color: theme.primaryDark, fontWeight: '700' },
              ]}>
                {tab.label} ({tab.count})
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Alerts List */}
        <View style={styles.alertsList}>
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))
          ) : (
            <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <MaterialCommunityIcons name="bell-check-outline" size={48} color={theme.primary} />
              <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>{t('allSystemsOptimal', 'All Systems Optimal')}</Text>
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>{t('noActiveAlerts', 'No active warnings or alerts for your storage.')}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 120,
  },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  badgeCount: {
    backgroundColor: colors.card,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  actionBtnsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.card,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  alertsList: {
    gap: 2,
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 12,
  },
  emptyText: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
});
