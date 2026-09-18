import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2200);

    return () => clearTimeout(timer);
  }, [onFinish]);

  const flowNodes = [
    { icon: 'weather-windy', label: 'Wind', color: colors.secondary },
    { icon: 'flash', label: 'Energy', color: colors.warning },
    { icon: 'battery-charging-90', label: 'Battery', color: colors.primary },
    { icon: 'snowflake', label: 'Cooling', color: colors.secondary },
    { icon: 'fruit-cherries', label: 'Crops', color: colors.primary },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f172a', '#0d2238', '#0f172a']}
        style={styles.gradient}
      >
        {/* App Logo & Title */}
        <View style={styles.centerContent}>
          <View style={styles.logoBadge}>
            <Image
              source={require('../../assets/icon.png')}
              style={styles.logoImage}
              resizeMode="cover"
            />
          </View>

          <Text style={styles.title}>SMART COLD STORAGE</Text>
          <Text style={styles.tagline}>Wind Powered • AI Enabled • Farmer First</Text>
        </View>

        {/* Minimal Animated Flow Diagram */}
        <View style={styles.flowContainer}>
          <Text style={styles.flowHeading}>ECOSYSTEM FLOW</Text>
          <View style={styles.flowRow}>
            {flowNodes.map((node, idx) => (
              <React.Fragment key={idx}>
                <View style={styles.flowItem}>
                  <View style={[styles.flowIconCircle, { borderColor: node.color }]}>
                    <MaterialCommunityIcons name={node.icon as any} size={16} color={node.color} />
                  </View>
                  <Text style={styles.flowLabel}>{node.label}</Text>
                </View>
                {idx < flowNodes.length - 1 && (
                  <MaterialCommunityIcons name="arrow-right-thin" size={16} color={colors.textLight} />
                )}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>AI-Powered Agricultural Cold Chain</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  centerContent: {
    alignItems: 'center',
    marginTop: 60,
  },
  logoBadge: {
    width: 96,
    height: 96,
    borderRadius: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: '#0f172a',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    marginTop: 6,
    textAlign: 'center',
  },
  flowContainer: {
    width: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
  },
  flowHeading: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1,
    marginBottom: 12,
  },
  flowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  flowItem: {
    alignItems: 'center',
  },
  flowIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  flowLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#ffffff',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
});
