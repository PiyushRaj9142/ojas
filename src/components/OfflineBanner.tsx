import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface OfflineBannerProps {
  isOffline: boolean;
  onSync?: () => void;
}

export default function OfflineBanner({ isOffline, onSync }: OfflineBannerProps) {
  if (!isOffline) return null;

  return (
    <View style={styles.banner}>
      <View style={styles.left}>
        <MaterialCommunityIcons name="cloud-off-outline" size={16} color="#ffffff" />
        <Text style={styles.text}>OFFLINE MODE • Showing last synced data (2m ago)</Text>
      </View>

      {onSync && (
        <TouchableOpacity style={styles.syncBtn} onPress={onSync} activeOpacity={0.8}>
          <Feather name="refresh-cw" size={12} color="#ffffff" />
          <Text style={styles.syncText}>Sync</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#334155',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  text: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  syncText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
});
