import React, { useRef, useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (otp: string) => void;
  disabled?: boolean;
  hasError?: boolean;
}

export default function OtpInput({
  length = 6,
  value,
  onChange,
  disabled = false,
  hasError = false,
}: OtpInputProps) {
  const { theme } = useTheme();
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);

  // Array of single-character digits
  const digits = Array.from({ length }, (_, i) => value[i] || '');

  const handleChangeText = (text: string, index: number) => {
    if (disabled) return;

    // Handle full paste of OTP
    const cleanDigits = text.replace(/\D/g, '');
    if (cleanDigits.length > 1) {
      const pasted = cleanDigits.slice(0, length);
      onChange(pasted);
      const nextFocus = Math.min(pasted.length, length - 1);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    const singleDigit = cleanDigits.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = singleDigit;
    const newOtp = newDigits.join('');
    onChange(newOtp);

    // Auto-advance to next box
    if (singleDigit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Move to previous box if current box is already empty
        inputRefs.current[index - 1]?.focus();
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        onChange(newDigits.join(''));
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputsRow}>
        {digits.map((digit, index) => {
          const isFocused = focusedIndex === index;
          const isFilled = Boolean(digit);

          return (
            <View
              key={index}
              style={[
                styles.box,
                {
                  backgroundColor: theme.backgroundSubtle,
                  borderColor: hasError
                    ? theme.danger
                    : isFocused
                    ? theme.primary
                    : isFilled
                    ? theme.borderDark
                    : theme.border,
                },
                isFocused && styles.boxFocused,
                hasError && styles.boxError,
              ]}
            >
              <TextInput
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                style={[
                  styles.input,
                  { color: theme.textPrimary },
                ]}
                value={digit}
                onChangeText={(text) => handleChangeText(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                onFocus={() => setFocusedIndex(index)}
                onBlur={() => setFocusedIndex(-1)}
                keyboardType="number-pad"
                maxLength={length} // Allow paste in individual box
                selectTextOnFocus={true}
                editable={!disabled}
                autoFocus={index === 0}
                textAlign="center"
                accessibilityLabel={`OTP digit ${index + 1}`}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    alignItems: 'center',
  },
  inputsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  box: {
    width: 44,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  boxFocused: {
    borderWidth: 2,
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  boxError: {
    borderWidth: 2,
  },
  input: {
    fontSize: 22,
    fontWeight: '800',
    width: '100%',
    height: '100%',
    textAlign: 'center',
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
  },
});
