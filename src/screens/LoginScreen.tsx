import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { OtpService } from '../services/otpService';
import OtpInput from '../components/OtpInput';

interface LoginScreenProps {
  onLoginSuccess: (mobile: string) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const { theme } = useTheme();

  const [mobile, setMobile] = useState('9876543210');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [demoHintOtp, setDemoHintOtp] = useState<string | null>(null);

  // Resend cooldown timer countdown
  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldown]);

  const handleSendOtp = async () => {
    setErrorMessage(null);
    setLoading(true);

    try {
      const result = await OtpService.sendOtp(mobile, 'LOGIN');
      setLoading(false);

      if (result.success) {
        setStep('OTP');
        setOtp('');
        setCooldown(result.cooldownSeconds || 45);
        if (result.devOtp) {
          setDemoHintOtp(result.devOtp);
        }
      } else {
        setErrorMessage(result.message);
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMessage('Failed to send OTP. Please check your internet connection.');
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0 || loading) return;
    setErrorMessage(null);
    setLoading(true);

    try {
      const result = await OtpService.sendOtp(mobile, 'LOGIN');
      setLoading(false);

      if (result.success) {
        setCooldown(result.cooldownSeconds || 45);
        if (result.devOtp) {
          setDemoHintOtp(result.devOtp);
        }
      } else {
        setErrorMessage(result.message);
      }
    } catch {
      setLoading(false);
      setErrorMessage('Could not resend OTP. Please try again.');
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) {
      setErrorMessage('Please enter the full 6-digit OTP.');
      return;
    }

    setErrorMessage(null);
    setLoading(true);

    try {
      const result = await OtpService.verifyOtp(mobile, otp, 'LOGIN');
      setLoading(false);

      if (result.success) {
        onLoginSuccess(mobile);
      } else {
        setErrorMessage(result.message);
      }
    } catch {
      setLoading(false);
      setErrorMessage('Verification failed. Please try again.');
    }
  };

  const handleUseDemoOtp = () => {
    if (demoHintOtp) {
      setOtp(demoHintOtp);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        {/* Header Branding */}
        <View style={styles.brandHeader}>
          <View style={[styles.logoBadge, { borderColor: theme.border, shadowColor: theme.primary }]}>
            <Image
              source={require('../../assets/icon.png')}
              style={styles.logoImage}
              resizeMode="cover"
            />
          </View>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Smart Cold Storage</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {step === 'PHONE'
              ? 'Enter your registered mobile number to access your cold storage dashboard'
              : `Enter the 6-digit OTP sent to +91 ******${mobile.slice(-4)}`}
          </Text>
        </View>

        {/* Form Card */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.shadowColor }]}>
          {errorMessage && (
            <View style={[styles.errorBanner, { backgroundColor: theme.dangerLight, borderColor: theme.danger }]}>
              <Feather name="alert-circle" size={14} color={theme.danger} />
              <Text style={[styles.errorText, { color: theme.danger }]}>{errorMessage}</Text>
            </View>
          )}

          {step === 'PHONE' ? (
            <>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                Mobile Number / मोबाइल नंबर
              </Text>
              <View style={styles.phoneInputRow}>
                <View style={[styles.prefixBox, { backgroundColor: theme.backgroundSubtle, borderColor: theme.border }]}>
                  <Text style={[styles.prefixText, { color: theme.textPrimary }]}>🇮🇳 +91</Text>
                </View>
                <TextInput
                  style={[
                    styles.phoneInput,
                    {
                      backgroundColor: theme.backgroundSubtle,
                      borderColor: theme.border,
                      color: theme.textPrimary,
                    },
                  ]}
                  placeholder="Enter 10-digit number"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={mobile}
                  onChangeText={(text) => {
                    setMobile(text.replace(/\D/g, ''));
                    setErrorMessage(null);
                  }}
                  editable={!loading}
                />
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, loading && { opacity: 0.7 }]}
                onPress={handleSendOtp}
                activeOpacity={0.85}
                disabled={loading}
              >
                <LinearGradient colors={theme.gradientGreen} style={styles.btnGradient}>
                  {loading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.btnText}>Send Verification OTP →</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                6-Digit Verification Code
              </Text>

              <OtpInput
                length={6}
                value={otp}
                onChange={(val) => {
                  setOtp(val);
                  setErrorMessage(null);
                }}
                disabled={loading}
                hasError={Boolean(errorMessage)}
              />

              {demoHintOtp && (
                <TouchableOpacity
                  style={[styles.demoOtpBadge, { backgroundColor: theme.primaryLight, borderColor: theme.primary }]}
                  onPress={handleUseDemoOtp}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="cellphone-key" size={14} color={theme.primary} />
                  <Text style={[styles.demoOtpText, { color: theme.primaryDark }]}>
                    Demo Test Code: <Text style={styles.demoOtpCode}>{demoHintOtp}</Text> (Tap to fill)
                  </Text>
                </TouchableOpacity>
              )}

              {/* Resend Cooldown Timer */}
              <View style={styles.resendRow}>
                {cooldown > 0 ? (
                  <Text style={[styles.cooldownText, { color: theme.textMuted }]}>
                    Resend code in <Text style={{ color: theme.textPrimary, fontWeight: '800' }}>{cooldown}s</Text>
                  </Text>
                ) : (
                  <TouchableOpacity onPress={handleResendOtp} disabled={loading} style={styles.resendBtn}>
                    <Feather name="refresh-cw" size={13} color={theme.primary} />
                    <Text style={[styles.resendBtnText, { color: theme.primaryDark }]}>Resend OTP</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Verify Button */}
              <TouchableOpacity
                style={[styles.submitBtn, (otp.length < 6 || loading) && { opacity: 0.75 }]}
                onPress={handleVerifyOtp}
                activeOpacity={0.85}
                disabled={otp.length < 6 || loading}
              >
                <LinearGradient colors={theme.gradientGreen} style={styles.btnGradient}>
                  {loading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.btnText}>Verify & Login ✓</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Change Number */}
              <TouchableOpacity
                onPress={() => {
                  setStep('PHONE');
                  setErrorMessage(null);
                }}
                style={styles.changePhoneBtn}
                disabled={loading}
              >
                <Feather name="arrow-left" size={13} color={theme.secondary} />
                <Text style={[styles.changePhoneText, { color: theme.secondary }]}>
                  Change Mobile Number
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <Text style={[styles.footerNote, { color: theme.textMuted }]}>
        🔒 256-bit Encrypted Telecommunication OTP Authentication • v2.4
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 24,
  },
  content: {
    paddingTop: 10,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 66,
    height: 66,
    borderRadius: 20,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
    overflow: 'hidden',
    borderWidth: 1.5,
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 12.5,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 16,
    lineHeight: 18,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 14,
  },
  errorText: {
    fontSize: 11.5,
    fontWeight: '700',
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  phoneInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  prefixBox: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  prefixText: {
    fontSize: 14,
    fontWeight: '700',
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '700',
  },
  demoOtpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    marginVertical: 4,
  },
  demoOtpText: {
    fontSize: 11,
    fontWeight: '600',
  },
  demoOtpCode: {
    fontWeight: '900',
    letterSpacing: 1,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  cooldownText: {
    fontSize: 11.5,
  },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  resendBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  submitBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  btnGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#ffffff',
    fontSize: 14.5,
    fontWeight: '800',
  },
  changePhoneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
    padding: 6,
  },
  changePhoneText: {
    fontSize: 12,
    fontWeight: '700',
  },
  footerNote: {
    fontSize: 10.5,
    textAlign: 'center',
  },
});
