import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { DemoStep } from '../types/demo';

interface DemoControllerProps {
  currentStep: DemoStep;
  currentStepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onStop: () => void;
}

export default function DemoController({
  currentStep,
  currentStepIndex,
  totalSteps,
  onNext,
  onPrev,
  onStop,
}: DemoControllerProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <View style={styles.demoPill}>
            <MaterialCommunityIcons name="presentation-play" size={14} color="#ffffff" />
            <Text style={styles.demoPillText}>JUDGE DEMO MODE</Text>
          </View>
          <Text style={styles.stepProgress}>Step {currentStepIndex + 1} of {totalSteps}</Text>
        </View>

        <TouchableOpacity onPress={onStop} style={styles.stopBtn}>
          <Feather name="x" size={16} color={colors.textSecondary} />
          <Text style={styles.stopText}>Exit</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>{currentStep.title}</Text>
      <Text style={styles.description}>{currentStep.description}</Text>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.navBtn, currentStepIndex === 0 && styles.navBtnDisabled]}
          onPress={onPrev}
          disabled={currentStepIndex === 0}
        >
          <Feather name="chevron-left" size={16} color={currentStepIndex === 0 ? colors.textLight : colors.textPrimary} />
          <Text style={[styles.navBtnText, currentStepIndex === 0 && styles.navBtnTextDisabled]}>Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.nextBtn}
          onPress={onNext}
        >
          <Text style={styles.nextBtnText}>
            {currentStepIndex === totalSteps - 1 ? 'Finish Demo' : 'Next Step →'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0f172a',
    padding: 14,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  demoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  demoPillText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  stepProgress: {
    color: colors.textLight,
    fontSize: 11,
    fontWeight: '600',
  },
  stopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  stopText: {
    color: colors.textLight,
    fontSize: 11,
    fontWeight: '600',
  },
  title: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  description: {
    color: '#cbd5e1',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
    marginBottom: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
  navBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  navBtnTextDisabled: {
    color: colors.textLight,
  },
  nextBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  nextBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
});
