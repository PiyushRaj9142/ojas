import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { ThemeMode } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { LanguageCode } from '../types/user';
import ThemeSwitcher from './ThemeSwitcher';

export interface ThemeSelectorProps {
  language?: LanguageCode;
  compact?: boolean;
  variant?: 'segmented' | 'dropdown' | 'compact';
  onThemeChanged?: (mode: ThemeMode) => void;
  style?: object;
}

export default function ThemeSelector({
  language = 'en',
  compact = false,
  variant = 'segmented',
  onThemeChanged,
  style,
}: ThemeSelectorProps) {
  const { theme, themeMode, setThemeMode } = useTheme();

  if (variant === 'dropdown') {
    return (
      <ThemeSwitcher
        language={language}
        compactIconOnly={compact}
        onThemeChanged={onThemeChanged}
        style={style}
      />
    );
  }

  const handleSelect = (mode: ThemeMode) => {
    setThemeMode(mode);
    if (onThemeChanged) {
      onThemeChanged(mode);
    }
  };

  const themeOptions: {
    id: ThemeMode;
    title: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    badgeColor: string;
    tooltip: string;
  }[] = [
    {
      id: 'LIGHT',
      title: language === 'hi' ? 'दिन / धूप' : 'Light',
      icon: 'weather-sunny',
      badgeColor: '#eab308',
      tooltip: 'Light mode / धूप',
    },
    {
      id: 'MILD',
      title: language === 'hi' ? 'आरामदेह' : 'Mild',
      icon: 'weather-sunset',
      badgeColor: '#f97316',
      tooltip: 'Mild mode / आरामदेह',
    },
    {
      id: 'DARK',
      title: language === 'hi' ? 'रात / मंडी' : 'Dark',
      icon: 'weather-night',
      badgeColor: '#38bdf8',
      tooltip: 'Dark mode / रात',
    },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundSubtle,
          borderColor: theme.border,
          shadowColor: theme.shadowColor,
        },
        style,
      ]}
      accessibilityRole="radiogroup"
      accessibilityLabel="Theme selection"
    >
      <View style={styles.segmentRow}>
        {themeOptions.map((opt) => {
          const isActive = themeMode === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              style={[
                styles.segmentBtn,
                {
                  backgroundColor: isActive
                    ? (themeMode === 'DARK' ? '#182742' : theme.card)
                    : 'transparent',
                  borderColor: isActive ? theme.primary : 'transparent',
                },
                isActive && styles.segmentBtnActive,
              ]}
              onPress={() => handleSelect(opt.id)}
              activeOpacity={0.7}
              accessibilityRole="radio"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`${opt.tooltip}${isActive ? ', active' : ''}`}
            >
              <MaterialCommunityIcons
                name={opt.icon}
                size={15}
                color={isActive ? opt.badgeColor : theme.textSecondary}
              />
              <Text
                style={[
                  styles.segmentText,
                  {
                    color: isActive ? theme.textPrimary : theme.textSecondary,
                    fontWeight: isActive ? '800' : '600',
                  },
                ]}
                numberOfLines={1}
              >
                {opt.title}
              </Text>
              {isActive && (
                <Feather
                  name="check"
                  size={12}
                  color={theme.primary}
                  style={styles.checkIcon}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 3,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  segmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  segmentBtnActive: {
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 11.5,
    letterSpacing: 0.2,
  },
  checkIcon: {
    marginLeft: 1,
  },
});
