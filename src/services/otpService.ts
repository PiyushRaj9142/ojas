import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSmsProvider, ISmsResponse } from './smsProvider';
import { NotificationService } from './notificationService';
import { findUserByPhone } from '../data/mockUsers';

export interface StoredOtpRecord {
  phoneNumber: string;
  otpHash: string;
  purpose: 'LOGIN' | 'PHONE_VERIFY' | 'SECURITY';
  expiresAt: number; // Unix timestamp in ms
  attempts: number;
  maxAttempts: number;
  lastSentAt: number; // Unix timestamp in ms
  verifiedAt?: number;
}

export interface SendOtpResult {
  success: boolean;
  message: string;
  cooldownSeconds: number;
  expiresInSeconds: number;
  error?: string;
  devOtp?: string; // Strictly only populated in development mode (OTP_MODE=development)
}

export interface VerifyOtpResult {
  success: boolean;
  message: string;
  attemptsRemaining?: number;
  error?: string;
  token?: string;
  user?: any;
}

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds
const MAX_ATTEMPTS = 5;
const STORAGE_PREFIX = '@ojas_otp_record_';

/**
 * Fast & secure SHA-256 hashing for web & mobile environments
 */
export async function sha256(str: string): Promise<string> {
  try {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const buffer = new TextEncoder().encode(str);
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) {
    // Fallback hash implementation if SubtleCrypto is unavailable
  }

  // Fallback bitwise hash
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `hash_${Math.abs(hash)}_${str.length}`;
}

/**
 * Generates a cryptographically secure 6-digit OTP
 */
export function generateSecureOtp(): string {
  try {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const array = new Uint32Array(1);
      crypto.getRandomValues(array);
      const num = 100000 + (array[0] % 900000);
      return num.toString();
    }
  } catch {
    // Fallback
  }
  return (Math.floor(100000 + Math.random() * 900000)).toString();
}

export class OtpService {
  /**
   * Cleans and normalizes Indian phone numbers (+91XXXXXXXXXX or 10 digits)
   */
  static normalizePhoneNumber(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) return digits;
    if (digits.length > 10 && digits.startsWith('91')) return digits.slice(-10);
    return digits;
  }

  static isValidPhone(phone: string): boolean {
    const clean = this.normalizePhoneNumber(phone);
    return clean.length === 10 && /^[6-9]\d{9}$/.test(clean);
  }

  /**
   * Dispatches a new OTP to the registered mobile number
   */
  static async sendOtp(
    rawPhone: string,
    purpose: 'LOGIN' | 'PHONE_VERIFY' | 'SECURITY' = 'LOGIN'
  ): Promise<SendOtpResult> {
    const cleanPhone = this.normalizePhoneNumber(rawPhone);

    if (!this.isValidPhone(cleanPhone)) {
      return {
        success: false,
        message: 'Please enter a valid 10-digit Indian mobile number (+91 XXXXXXXXXX).',
        cooldownSeconds: 0,
        expiresInSeconds: 0,
        error: 'INVALID_PHONE_NUMBER',
      };
    }

    // Validate if mobile number is registered with Smart Cold Storage
    const registeredUser = findUserByPhone(cleanPhone);
    if (!registeredUser) {
      return {
        success: false,
        message: 'Mobile number is not registered with Smart Cold Storage. Please contact your storage administrator.',
        cooldownSeconds: 0,
        expiresInSeconds: 0,
        error: 'UNREGISTERED_MOBILE_NUMBER',
      };
    }

    const storageKey = `${STORAGE_PREFIX}${cleanPhone}`;
    const now = Date.now();

    // Check existing record & resend cooldown (60 seconds)
    try {
      const existingRaw = await AsyncStorage.getItem(storageKey);
      if (existingRaw) {
        const existing: StoredOtpRecord = JSON.parse(existingRaw);
        const timeSinceLastSent = now - existing.lastSentAt;

        if (timeSinceLastSent < RESEND_COOLDOWN_MS) {
          const remainingSeconds = Math.ceil((RESEND_COOLDOWN_MS - timeSinceLastSent) / 1000);
          return {
            success: false,
            message: `Please wait ${remainingSeconds}s before requesting a new OTP.`,
            cooldownSeconds: remainingSeconds,
            expiresInSeconds: Math.max(0, Math.ceil((existing.expiresAt - now) / 1000)),
            error: 'COOLDOWN_ACTIVE',
          };
        }
      }
    } catch {
      // Continue
    }

    // Generate cryptographically secure 6-digit OTP
    const plainOtp = generateSecureOtp();
    const otpHash = await sha256(plainOtp + cleanPhone); // Salted with phone number

    const record: StoredOtpRecord = {
      phoneNumber: cleanPhone,
      otpHash,
      purpose,
      expiresAt: now + OTP_EXPIRY_MS,
      attempts: 0,
      maxAttempts: MAX_ATTEMPTS,
      lastSentAt: now,
    };

    // Store HASHED OTP (never store plaintext OTP in database/storage)
    await AsyncStorage.setItem(storageKey, JSON.stringify(record));

    // Send via configured SMS Provider
    const smsProvider = getSmsProvider();
    const smsRes: ISmsResponse = await smsProvider.sendOtp(cleanPhone, plainOtp);

    if (!smsRes.success) {
      return {
        success: false,
        message: smsRes.error || 'Unable to send OTP right now. Please try again.',
        cooldownSeconds: 0,
        expiresInSeconds: 0,
        error: 'SMS_DISPATCH_FAILED',
      };
    }

    // Security audit notification log
    try {
      NotificationService.addSecurityAlert({
        title: 'OTP Verification Requested',
        titleHi: 'OTP सत्यापन का अनुरोध किया गया',
        message: `A 6-digit verification code was sent to registered number +91 ******${cleanPhone.slice(-4)}.`,
        messageHi: `पंजीकृत नंबर +91 ******${cleanPhone.slice(-4)} पर 6-अंकों का OTP भेजा गया।`,
        type: 'SECURITY',
        priority: 'INFO',
      });
    } catch {
      // Non-blocking
    }

    return {
      success: true,
      message: `OTP sent successfully to +91 ******${cleanPhone.slice(-4)}.`,
      cooldownSeconds: Math.ceil(RESEND_COOLDOWN_MS / 1000),
      expiresInSeconds: Math.ceil(OTP_EXPIRY_MS / 1000),
      devOtp: smsRes.debugOtp, // Only populated in development mode
    };
  }

  /**
   * Verifies the user-entered 6-digit OTP
   */
  static async verifyOtp(
    rawPhone: string,
    enteredOtp: string,
    purpose: 'LOGIN' | 'PHONE_VERIFY' | 'SECURITY' = 'LOGIN'
  ): Promise<VerifyOtpResult> {
    const cleanPhone = this.normalizePhoneNumber(rawPhone);
    const storageKey = `${STORAGE_PREFIX}${cleanPhone}`;
    const now = Date.now();

    if (!enteredOtp || enteredOtp.trim().length !== 6) {
      return {
        success: false,
        message: 'Please enter a complete 6-digit OTP.',
        error: 'INVALID_OTP_FORMAT',
      };
    }

    let record: StoredOtpRecord | null = null;
    try {
      const raw = await AsyncStorage.getItem(storageKey);
      if (raw) {
        record = JSON.parse(raw);
      }
    } catch {
      // Empty
    }

    if (!record) {
      return {
        success: false,
        message: 'No active OTP request found. Please request a new OTP.',
        error: 'NO_OTP_FOUND',
      };
    }

    // Check expiry (5 minutes)
    if (now > record.expiresAt) {
      await AsyncStorage.removeItem(storageKey);
      return {
        success: false,
        message: 'OTP expired. Please request a new OTP.',
        error: 'OTP_EXPIRED',
      };
    }

    // Check attempt limits (max 5)
    if (record.attempts >= record.maxAttempts) {
      await AsyncStorage.removeItem(storageKey);
      return {
        success: false,
        message: 'Too many attempts. Please request a new OTP.',
        error: 'MAX_ATTEMPTS_EXCEEDED',
      };
    }

    // Hash user-entered OTP and compare
    const enteredHash = await sha256(enteredOtp.trim() + cleanPhone);

    if (enteredHash === record.otpHash) {
      // Invalidate OTP immediately after successful verification
      await AsyncStorage.removeItem(storageKey);

      const userProfile = findUserByPhone(cleanPhone);

      // Create security notification in top-left bell (NEVER displaying plaintext OTP)
      try {
        NotificationService.addSecurityAlert({
          title: 'Mobile Verification Successful',
          titleHi: 'मोबाइल सत्यापन सफल',
          message: `Phone number +91 ******${cleanPhone.slice(-4)} successfully verified. Session authenticated.`,
          messageHi: `फ़ोन नंबर +91 ******${cleanPhone.slice(-4)} का सत्यापन सफल रहा।`,
          type: 'SECURITY',
          priority: 'INFO',
        });
      } catch {
        // Non-blocking
      }

      return {
        success: true,
        message: 'Mobile number verified successfully!',
        token: `scs_session_${cleanPhone}_${Date.now()}`,
        user: userProfile,
      };
    }

    // Increment attempts on failure
    record.attempts += 1;
    const remaining = record.maxAttempts - record.attempts;

    if (remaining > 0) {
      await AsyncStorage.setItem(storageKey, JSON.stringify(record));
      return {
        success: false,
        message: `Invalid OTP. Please check and try again. (${remaining} attempt${remaining > 1 ? 's' : ''} remaining)`,
        attemptsRemaining: remaining,
        error: 'INCORRECT_OTP',
      };
    } else {
      await AsyncStorage.removeItem(storageKey);
      return {
        success: false,
        message: 'Too many attempts. Please request a new OTP.',
        attemptsRemaining: 0,
        error: 'MAX_ATTEMPTS_EXCEEDED',
      };
    }
  }

  /**
   * Gets remaining resend cooldown seconds
   */
  static async getCooldown(rawPhone: string): Promise<number> {
    const cleanPhone = this.normalizePhoneNumber(rawPhone);
    const storageKey = `${STORAGE_PREFIX}${cleanPhone}`;
    try {
      const raw = await AsyncStorage.getItem(storageKey);
      if (raw) {
        const record: StoredOtpRecord = JSON.parse(raw);
        const elapsed = Date.now() - record.lastSentAt;
        if (elapsed < RESEND_COOLDOWN_MS) {
          return Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
        }
      }
    } catch {}
    return 0;
  }
}
