import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { AIExecutionTrace } from '../types/ai';

interface AIObservabilityModalProps {
  visible: boolean;
  onClose: () => void;
  traces: AIExecutionTrace[];
}

export default function AIObservabilityModal({
  visible,
  onClose,
  traces,
}: AIObservabilityModalProps) {
  const latestTrace = traces[traces.length - 1];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <MaterialCommunityIcons name="radar" size={20} color={colors.primary} />
              <Text style={styles.headerTitle}>AI Pipeline & Observability</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* System Status Badges */}
            <View style={styles.badgeRow}>
              <View style={[styles.badge, { backgroundColor: 'rgba(22, 163, 74, 0.12)' }]}>
                <View style={[styles.dot, { backgroundColor: '#16a34a' }]} />
                <Text style={[styles.badgeText, { color: '#16a34a' }]}>Strict Scope Active</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: 'rgba(2, 132, 199, 0.12)' }]}>
                <View style={[styles.dot, { backgroundColor: '#0284c7' }]} />
                <Text style={[styles.badgeText, { color: '#0284c7' }]}>Bilingual Voice Engine</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: 'rgba(168, 85, 247, 0.12)' }]}>
                <View style={[styles.dot, { backgroundColor: '#a855f7' }]} />
                <Text style={[styles.badgeText, { color: '#a855f7' }]}>Anti-Injection Firewall</Text>
              </View>
            </View>

            {/* Architecture Pipeline Flow */}
            <View style={styles.card}>
              <Text style={styles.cardHeading}>UNIFIED TEXT & VOICE PIPELINE</Text>
              <View style={styles.pipelineSteps}>
                <View style={styles.step}>
                  <Text style={styles.stepNum}>1</Text>
                  <Text style={styles.stepText}>STT / Text</Text>
                </View>
                <Feather name="arrow-right" size={12} color={colors.textMuted} />
                <View style={styles.step}>
                  <Text style={styles.stepNum}>2</Text>
                  <Text style={styles.stepText}>Scope Guard</Text>
                </View>
                <Feather name="arrow-right" size={12} color={colors.textMuted} />
                <View style={styles.step}>
                  <Text style={styles.stepNum}>3</Text>
                  <Text style={styles.stepText}>Tools / RAG</Text>
                </View>
                <Feather name="arrow-right" size={12} color={colors.textMuted} />
                <View style={styles.step}>
                  <Text style={styles.stepNum}>4</Text>
                  <Text style={styles.stepText}>TTS Speech</Text>
                </View>
              </View>
            </View>

            {/* Latest Query Trace */}
            {latestTrace && (
              <View style={styles.card}>
                <View style={styles.traceHeaderRow}>
                  <Text style={styles.cardHeading}>LATEST QUERY TRACE</Text>
                  <View style={[
                    styles.modeBadge,
                    latestTrace.isVoice ? { backgroundColor: 'rgba(2, 132, 199, 0.15)' } : { backgroundColor: 'rgba(100, 116, 139, 0.15)' }
                  ]}>
                    <MaterialCommunityIcons
                      name={latestTrace.isVoice ? "microphone" : "message-text-outline"}
                      size={12}
                      color={latestTrace.isVoice ? '#0284c7' : colors.textMuted}
                    />
                    <Text style={[
                      styles.modeBadgeText,
                      latestTrace.isVoice ? { color: '#0284c7' } : { color: colors.textMuted }
                    ]}>
                      {latestTrace.isVoice ? 'VOICE MODE' : 'TEXT MODE'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.traceRow}>
                  <Text style={styles.traceLabel}>Query:</Text>
                  <Text style={styles.traceVal}>"{latestTrace.query}"</Text>
                </View>

                <View style={styles.traceGrid}>
                  <View style={styles.gridItem}>
                    <Text style={styles.traceLabel}>Detected Language:</Text>
                    <Text style={styles.traceValHighlight}>{latestTrace.detectedLanguage.toUpperCase()}</Text>
                  </View>
                  <View style={styles.gridItem}>
                    <Text style={styles.traceLabel}>Scope Classification:</Text>
                    <Text style={[
                      styles.traceValHighlight,
                      latestTrace.scope === 'IN_SCOPE' ? { color: '#16a34a' } : { color: '#ef4444' }
                    ]}>
                      {latestTrace.scope}
                    </Text>
                  </View>
                  <View style={styles.gridItem}>
                    <Text style={styles.traceLabel}>Intent Identified:</Text>
                    <Text style={styles.traceValHighlight}>{latestTrace.intent}</Text>
                  </View>
                  <View style={styles.gridItem}>
                    <Text style={styles.traceLabel}>AI Latency:</Text>
                    <Text style={styles.traceValHighlight}>{latestTrace.latencyMs} ms</Text>
                  </View>
                </View>

                {latestTrace.spokenResponse && (
                  <View style={styles.speechBox}>
                    <Text style={styles.speechHeading}>🗣️ Speech-Formatted Output (for TTS)</Text>
                    <Text style={styles.speechText}>"{latestTrace.spokenResponse}"</Text>
                  </View>
                )}

                {latestTrace.toolExecuted && (
                  <View style={styles.toolBox}>
                    <Text style={styles.toolHeading}>⚙️ Executed Platform Tool</Text>
                    <Text style={styles.toolName}>{latestTrace.toolExecuted}</Text>
                    {latestTrace.toolResultSummary && (
                      <Text style={styles.toolResult}>{latestTrace.toolResultSummary}</Text>
                    )}
                  </View>
                )}

                {latestTrace.retrievedChunks.length > 0 && (
                  <View style={styles.ragBox}>
                    <Text style={styles.ragHeading}>📚 Retrieved RAG Knowledge Chunks</Text>
                    {latestTrace.retrievedChunks.map((chunkId, idx) => (
                      <Text key={idx} style={styles.ragChunk}>• {chunkId}</Text>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Execution Trace History */}
            <View style={styles.card}>
              <Text style={styles.cardHeading}>ALL LOGGED QUERIES ({traces.length})</Text>
              {traces.length === 0 ? (
                <Text style={styles.emptyText}>No queries logged yet. Send a prompt to see live traces.</Text>
              ) : (
                traces.slice().reverse().map((tr, idx) => (
                  <View key={idx} style={styles.historyItem}>
                    <View style={styles.historyHeader}>
                      <Text style={styles.historyTime}>{tr.timestamp}</Text>
                      <View style={[
                        styles.historyPill,
                        tr.scope === 'IN_SCOPE' ? { backgroundColor: 'rgba(22, 163, 74, 0.15)' } : { backgroundColor: 'rgba(239, 68, 68, 0.15)' }
                      ]}>
                        <Text style={[
                          styles.historyPillText,
                          tr.scope === 'IN_SCOPE' ? { color: '#16a34a' } : { color: '#ef4444' }
                        ]}>
                          {tr.scope}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.historyQuery}>"{tr.query}"</Text>
                    <Text style={styles.historyMeta}>
                      Intent: {tr.intent} • Lang: {tr.detectedLanguage} • Latency: {tr.latencyMs}ms
                    </Text>
                  </View>
                ))
              )}
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
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 14,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  card: {
    backgroundColor: colors.backgroundSubtle,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  cardHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  pipelineSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  step: {
    alignItems: 'center',
    gap: 4,
  },
  stepNum: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 20,
  },
  stepText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  traceRow: {
    gap: 2,
  },
  traceLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  traceVal: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  traceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridItem: {
    width: '47%',
    backgroundColor: colors.card,
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  traceValHighlight: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 2,
  },
  toolBox: {
    backgroundColor: 'rgba(2, 132, 199, 0.08)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(2, 132, 199, 0.2)',
    gap: 4,
  },
  toolHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284c7',
  },
  toolName: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: colors.textPrimary,
  },
  toolResult: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  ragBox: {
    backgroundColor: 'rgba(22, 163, 74, 0.08)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.2)',
    gap: 4,
  },
  ragHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#16a34a',
  },
  ragChunk: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: colors.textPrimary,
  },
  emptyText: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  traceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  modeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  speechBox: {
    backgroundColor: 'rgba(168, 85, 247, 0.08)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.2)',
    gap: 4,
  },
  speechHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#a855f7',
  },
  speechText: {
    fontSize: 12,
    color: colors.textPrimary,
    fontStyle: 'italic',
  },
  historyItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 8,
    gap: 3,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyTime: {
    fontSize: 10,
    color: colors.textMuted,
  },
  historyPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  historyPillText: {
    fontSize: 9,
    fontWeight: '800',
  },
  historyQuery: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  historyMeta: {
    fontSize: 10,
    color: colors.textMuted,
  },
});
