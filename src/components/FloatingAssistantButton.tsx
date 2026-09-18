import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';

interface FloatingAssistantButtonProps {
  onPress: () => void;
  language?: string;
}

export default function FloatingAssistantButton({
  onPress,
  language = 'en',
}: FloatingAssistantButtonProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={['#16a34a', '#0284c7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <MaterialCommunityIcons name="robot-happy" size={24} color="#ffffff" />
        <View style={styles.textBlock}>
          <Text style={styles.mainText}>AI Assistant</Text>
          <Text style={styles.subText}>{language === 'hi' ? 'किसान वाणी' : 'Ask Storage AI'}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 74,
    right: 16,
    borderRadius: 28,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 99,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 28,
    gap: 8,
  },
  textBlock: {
    flexDirection: 'column',
  },
  mainText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  subText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 9,
    fontWeight: '600',
  },
});
