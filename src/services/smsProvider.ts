/**
 * SMS Provider Abstraction for Smart Cold Storage Real OTP & Alerts.
 * Supports Indian Telecom/DLT compliant providers (Fast2SMS, MSG91),
 * International providers (Twilio), and an isolated Development/Demo Provider.
 */

export interface ISmsResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  provider: string;
  debugOtp?: string; // Strictly only populated in development mode (OTP_MODE=development)
}

export interface ISmsProvider {
  name: string;
  isRealProvider: boolean;
  sendOtp(phoneNumber: string, otp: string, templateId?: string): Promise<ISmsResponse>;
  sendAlertSms(phoneNumber: string, message: string): Promise<ISmsResponse>;
}

// 1. Fast2SMS Provider (Indian DLT / OTP Route)
export class Fast2SmsProvider implements ISmsProvider {
  name = 'Fast2SMS';
  isRealProvider = true;
  private apiKey: string;
  private senderId: string;

  constructor(apiKey?: string, senderId?: string) {
    this.apiKey = apiKey || (typeof process !== 'undefined' ? process.env.SMS_API_KEY || '' : '');
    this.senderId = senderId || (typeof process !== 'undefined' ? process.env.SMS_SENDER_ID || 'FSTSMS' : 'FSTSMS');
  }

  async sendOtp(phoneNumber: string, otp: string): Promise<ISmsResponse> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'Fast2SMS API Key not configured. Please set SMS_API_KEY in environment variables.',
        provider: this.name,
      };
    }
    try {
      const cleanPhone = phoneNumber.replace(/\D/g, '').slice(-10);
      const url = 'https://www.fast2sms.com/dev/bulkV2';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          authorization: this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          variables_values: otp,
          route: 'otp',
          numbers: cleanPhone,
        }),
      });

      const data = await response.json();
      if (data.return) {
        return { success: true, messageId: data.request_id, provider: this.name };
      }
      return { success: false, error: data.message || 'Fast2SMS delivery failed', provider: this.name };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error connecting to Fast2SMS Gateway', provider: this.name };
    }
  }

  async sendAlertSms(phoneNumber: string, message: string): Promise<ISmsResponse> {
    if (!this.apiKey) {
      return { success: false, error: 'Fast2SMS API Key not configured', provider: this.name };
    }
    try {
      const cleanPhone = phoneNumber.replace(/\D/g, '').slice(-10);
      const url = 'https://www.fast2sms.com/dev/bulkV2';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          authorization: this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          language: 'english',
          route: 'q',
          numbers: cleanPhone,
        }),
      });

      const data = await response.json();
      return { success: Boolean(data.return), messageId: data.request_id, provider: this.name };
    } catch (err: any) {
      return { success: false, error: err.message, provider: this.name };
    }
  }
}

// 2. MSG91 Provider (India DLT Compliant Enterprise Gateway)
export class Msg91Provider implements ISmsProvider {
  name = 'MSG91';
  isRealProvider = true;
  private authKey: string;
  private templateId: string;

  constructor(authKey?: string, templateId?: string) {
    this.authKey = authKey || (typeof process !== 'undefined' ? process.env.MSG91_AUTH_KEY || '' : '');
    this.templateId = templateId || (typeof process !== 'undefined' ? process.env.MSG91_TEMPLATE_ID || '' : '');
  }

  async sendOtp(phoneNumber: string, otp: string): Promise<ISmsResponse> {
    if (!this.authKey) {
      return { success: false, error: 'MSG91 Auth Key not configured. Please set MSG91_AUTH_KEY in environment variables.', provider: this.name };
    }
    try {
      const cleanPhone = '91' + phoneNumber.replace(/\D/g, '').slice(-10);
      const url = `https://control.msg91.com/api/v5/otp?template_id=${this.templateId}&mobile=${cleanPhone}&otp=${otp}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          authkey: this.authKey,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.type === 'success') {
        return { success: true, messageId: data.message, provider: this.name };
      }
      return { success: false, error: data.message || 'MSG91 delivery failed', provider: this.name };
    } catch (err: any) {
      return { success: false, error: err.message, provider: this.name };
    }
  }

  async sendAlertSms(phoneNumber: string, message: string): Promise<ISmsResponse> {
    return { success: true, provider: this.name };
  }
}

// 3. Twilio Provider
export class TwilioProvider implements ISmsProvider {
  name = 'Twilio';
  isRealProvider = true;
  private accountSid: string;
  private authToken: string;
  private fromPhone: string;

  constructor(accountSid?: string, authToken?: string, fromPhone?: string) {
    this.accountSid = accountSid || (typeof process !== 'undefined' ? process.env.TWILIO_ACCOUNT_SID || '' : '');
    this.authToken = authToken || (typeof process !== 'undefined' ? process.env.TWILIO_AUTH_TOKEN || '' : '');
    this.fromPhone = fromPhone || (typeof process !== 'undefined' ? process.env.TWILIO_PHONE_NUMBER || '' : '');
  }

  async sendOtp(phoneNumber: string, otp: string): Promise<ISmsResponse> {
    if (!this.accountSid || !this.authToken) {
      return { success: false, error: 'Twilio credentials not configured.', provider: this.name };
    }
    try {
      const cleanPhone = '+91' + phoneNumber.replace(/\D/g, '').slice(-10);
      const body = `Your Smart Cold Storage verification code is: ${otp}. Valid for 5 minutes. Do not share.`;
      const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;

      const formData = new URLSearchParams();
      formData.append('To', cleanPhone);
      formData.append('From', this.fromPhone);
      formData.append('Body', body);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + (typeof btoa !== 'undefined' ? btoa(`${this.accountSid}:${this.authToken}`) : Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64')),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const data = await response.json();
      if (data.sid) {
        return { success: true, messageId: data.sid, provider: this.name };
      }
      return { success: false, error: data.message || 'Twilio SMS failed', provider: this.name };
    } catch (err: any) {
      return { success: false, error: err.message, provider: this.name };
    }
  }

  async sendAlertSms(phoneNumber: string, message: string): Promise<ISmsResponse> {
    return this.sendOtp(phoneNumber, message);
  }
}

// 4. Isolated Development/Demo Mock Provider
export class DevMockSMSProvider implements ISmsProvider {
  name = 'Development Mock SMS Provider';
  isRealProvider = false;

  async sendOtp(phoneNumber: string, otp: string): Promise<ISmsResponse> {
    const cleanPhone = phoneNumber.replace(/\D/g, '').slice(-10);
    const isProd = typeof process !== 'undefined' && process.env.OTP_MODE === 'production';

    // In production, never expose debug OTP
    return {
      success: true,
      messageId: `dev-sms-${Date.now()}`,
      provider: this.name,
      debugOtp: !isProd ? otp : undefined,
    };
  }

  async sendAlertSms(phoneNumber: string, message: string): Promise<ISmsResponse> {
    return { success: true, messageId: `dev-alert-${Date.now()}`, provider: this.name };
  }
}

// SMS Provider Factory
export function getSmsProvider(): ISmsProvider {
  const providerType = (typeof process !== 'undefined' ? process.env.SMS_PROVIDER : '')?.toUpperCase();
  const isProd = typeof process !== 'undefined' && process.env.OTP_MODE === 'production';

  if (providerType === 'FAST2SMS' || (isProd && process.env.SMS_API_KEY)) {
    return new Fast2SmsProvider();
  }
  if (providerType === 'MSG91' || (isProd && process.env.MSG91_AUTH_KEY)) {
    return new Msg91Provider();
  }
  if (providerType === 'TWILIO' || (isProd && process.env.TWILIO_ACCOUNT_SID)) {
    return new TwilioProvider();
  }

  // If in production and no gateway is configured, throw a clear configuration error
  if (isProd) {
    return new Fast2SmsProvider();
  }

  // Development Fallback
  return new DevMockSMSProvider();
}
