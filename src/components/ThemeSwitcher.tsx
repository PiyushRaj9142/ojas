import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  Animated,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { ThemeMode } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { LanguageCode } from '../types/user';

interface ThemeSwitcherProps {
  language?: LanguageCode;
  compactIconOnly?: boolean;
  onThemeChanged?: (mode: ThemeMode) => void;
  style?: object;
}

interface ThemeOption {
  id: ThemeMode;
  titleEn: string;
  titleHi: string;
  subtitleEn: string;
  subtitleHi: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor: string;
  iconBg: string;
  description: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'LIGHT',
    titleEn: 'Light',
    titleHi: 'दिन / धूप',
    subtitleEn: 'Daylight & Sunlight',
    subtitleHi: 'खेत में तेज धूप हेतु',
    icon: 'weather-sunny',
    iconColor: '#eab308',
    iconBg: '#fef9c3',
    description: 'Crisp bright theme for outdoor sunlight',
  },
  {
    id: 'MILD',
    titleEn: 'Mild',
    titleHi: 'आरामदेह',
    subtitleEn: 'Eye Comfort / Sepia',
    subtitleHi: 'शाम व आँखों के आराम हेतु',
    icon: 'weather-sunset',
    iconColor: '#f97316',
    iconBg: '#ffedd5',
    description: 'Warm soothing tone for long usage',
  },
  {
    id: 'DARK',
    titleEn: 'Dark',
    titleHi: 'रात / मंडी',
    subtitleEn: 'Night Mandi & OLED',
    subtitleHi: 'रात में कम चमक व बैटरी बचत',
    icon: 'weather-night',
    iconColor: '#38bdf8',
    iconBg: '#0c4a6e',
    description: 'Deep low-glare dark theme',
  },
];

export default function ThemeSwitcher({
  language = 'en',
  compactIconOnly = false,
  onThemeChanged,
  style,
}: ThemeSwitcherProps) {
  const { theme, themeMode, setThemeMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [buttonLayout, setButtonLayout] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  
  const buttonRef = useRef<View>(null);
  const animScale = useRef(new Animated.Value(0.92)).current;
  const animOpacity = useRef(new Animated.Value(0)).current;

  const currentOption = THEME_OPTIONS.find((t) => t.id === themeMode) || THEME_OPTIONS[0];

  const openDropdown = () => {
    if (buttonRef.current && typeof buttonRef.current.measureInWindow === 'function') {
      buttonRef.current.measureInWindow((x, y, width, height) => {
        setButtonLayout({ x, y, width, height });
        setIsOpen(true);
      });
    } else {
      setIsOpen(true);
    }
  };

  const closeDropdown = () => {
    Animated.parallel([
      Animated.timing(animOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(animScale, {
        toValue: 0.92,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsOpen(false);
    });
  };

  useEffect(() => {
    if (isOpen) {
      animScale.setValue(0.92);
      animOpacity.setValue(0);
      Animated.parallel([
        Animated.timing(animOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.spring(animScale, {
          toValue: 1,
          friction: 8,
          tension: 65,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen]);

  const handleSelect = (mode: ThemeMode) => {
    setThemeMode(mode);
    if (onThemeChanged) {
      onThemeChanged(mode);
    }
    closeDropdown();
  };

  const currentTitle = language === 'hi' ? currentOption.titleHi : currentOption.titleEn;

  return (
    <View style={[styles.wrapper, style]} ref={buttonRef} collapsable={false}>
      {/* Pill-shaped Compact Trigger Button */}
      <TouchableOpacity
        style={[
          styles.pillButton,
          {
            backgroundColor: theme.backgroundSubtle,
            borderColor: isOpen ? theme.primary : theme.border,
            shadowColor: theme.shadowColor,
          },
          isOpen && styles.pillButtonActive,
        ]}
        onPress={isOpen ? closeDropdown : openDropdown}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={`Theme: ${currentTitle} mode. Click to change theme.`}
        accessibilityHint="Opens a menu to switch between Light, Mild, and Dark themes"
      >
        <View style={[styles.iconPill, { backgroundColor: currentOption.iconBg }]}>
          <MaterialCommunityIcons
            name={currentOption.icon}
            size={14}
            color={currentOption.iconColor}
          />
        </View>

        {!compactIconOnly && (
          <Text
            style={[
              styles.pillLabel,
              { color: theme.textPrimary },
            ]}
            numberOfLines={1}
          >
            {currentTitle}
          </Text>
        )}

        <Feather
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={12}
          color={theme.textMuted}
          style={styles.chevron}
        />
      </TouchableOpacity>

      {/* Popover Dropdown Modal */}
      <Modal
        visible={isOpen}
        transparent={true}
        animationType="none"
        onRequestClose={closeDropdown}
      >
        <TouchableWithoutFeedback onPress={closeDropdown}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <Animated.View
                style={[
                  styles.popoverCard,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                    shadowColor: theme.shadowColor,
                    opacity: animOpacity,
                    transform: [{ scale: animScale }],
                    ...(buttonLayout
                      ? {
                          top: Math.max(buttonLayout.y + buttonLayout.height + 6, 45),
                          right: Math.max(
                            Platform.OS === 'web' && typeof window !== 'undefined'
                              ? window.innerWidth - (buttonLayout.x + buttonLayout.width)
                              : 16,
                            16
                          ),
                        }
                      : { top: 56, right: 16 }),
                  },
                ]}
              >
                {/* Popover Header */}
                <View style={[styles.popoverHeader, { borderBottomColor: theme.borderLight }]}>
                  <Text style={[styles.popoverTitle, { color: theme.textSecondary }]}>
                    {language === 'hi' ? 'थीम चुनें / THEME' : 'SELECT THEME'}
                  </Text>
                </View>

                {/* 3 Theme Options */}
                <View style={styles.optionsContainer}>
                  {THEME_OPTIONS.map((opt) => {
                    const isActive = themeMode === opt.id;
                    const optTitle = language === 'hi' ? opt.titleHi : opt.titleEn;
                    const optSubtitle = language === 'hi' ? opt.subtitleHi : opt.subtitleEn;

                    return (
                      <TouchableOpacity
                        key={opt.id}
                        style={[
                          styles.optionItem,
                          {
                            backgroundColor: isActive
                              ? (themeMode === 'DARK' ? '#182742' : theme.primaryLight)
                              : 'transparent',
                            borderColor: isActive ? theme.primary : 'transparent',
                          },
                        ]}
                        onPress={() => handleSelect(opt.id)}
                        activeOpacity={0.7}
                        accessibilityRole="button"
                        accessibilityLabel={`${optTitle} mode${isActive ? ', currently selected' : ''}`}
                      >
                        {/* Icon Circle */}
                        <View
                          style={[
                            styles.optionIconCircle,
                            {
                              backgroundColor: isActive
                                ? theme.primary
                                : (themeMode === 'DARK' ? '#1e293b' : opt.iconBg),
                            },
                          ]}
                        >
                          <MaterialCommunityIcons
                            name={opt.icon}
                            size={16}
                            color={isActive ? '#ffffff' : opt.iconColor}
                          />
                        </View>

                        {/* Title & Subtitle */}
                        <View style={styles.optionTextContainer}>
                          <View style={styles.titleRow}>
                            <Text
                              style={[
                                styles.optionTitleText,
                                {
                                  color: isActive
                                    ? (themeMode === 'DARK' ? '#ffffff' : theme.primaryDark)
                                    : theme.textPrimary,
                                  fontWeight: isActive ? '800' : '600',
                                },
                              ]}
                            >
                              {optTitle}
                            </Text>
                          </View>
                          <Text
                            style={[
                              styles.optionSubtitleText,
                              {
                                color: isActive
                                  ? (themeMode === 'DARK' ? '#93c5fd' : theme.primaryDark)
                                  : theme.textMuted,
                              },
                            ]}
                            numberOfLines={1}
                          >
                            {optSubtitle}
                          </Text>
                        </View>

                        {/* Active Checkmark */}
                        {isActive && (
                          <View
                            style={[
                              styles.checkBadge,
                              { backgroundColor: theme.primary },
                            ]}
                          >
                            <Feather name="check" size={11} color="#ffffff" />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    zIndex: 50,
  },
  pillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  pillButtonActive: {
    borderWidth: 1.5,
  },
  iconPill: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  chevron: {
    marginLeft: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  popoverCard: {
    position: 'absolute',
    width: 205,
    borderRadius: 14,
    borderWidth: 1,
    padding: 6,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 9999,
  },
  popoverHeader: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomWidth: 1,
    marginBottom: 4,
  },
  popoverTitle: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  optionsContainer: {
    gap: 4,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  optionIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTextContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  optionTitleText: {
    fontSize: 12,
  },
  optionSubtitleText: {
    fontSize: 9.5,
    marginTop: 1,
  },
  checkBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
