import { LanguageCode } from '../types/user';
import { AIMessage, AIExecutionTrace, StructuredCardData } from '../types/ai';
import { AiPlatformTools } from './aiTools';
import { VoiceService } from './voiceService';

export interface StreamCallbacks {
  onChunk: (chunk: string, fullText: string) => void;
  onCard?: (card: StructuredCardData) => void;
  onTrace?: (trace: AIExecutionTrace) => void;
  onDone: (fullText: string, card?: StructuredCardData, trace?: AIExecutionTrace) => void;
  onError: (error: any) => void;
}

const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  hi: 'Respond in natural, fluent Hindi (हिन्दी) in Devanagari script for Indian farmers.',
  mr: 'Respond in natural, fluent Marathi (मराठी) for Maharashtra/Nashik farmers.',
  bn: 'Respond in natural, fluent Bengali (বাংলা) for farmers.',
  te: 'Respond in natural, fluent Telugu (తెలుగు) for farmers.',
  ta: 'Respond in natural, fluent Tamil (தமிழ்) for farmers.',
  gu: 'Respond in natural, fluent Gujarati (ગુજરાતી) for farmers.',
  kn: 'Respond in natural, fluent Kannada (ಕನ್ನಡ) for farmers.',
  ml: 'Respond in natural, fluent Malayalam (മലയാളം) for farmers.',
  pa: 'Respond in natural, fluent Punjabi (ਪੰਜਾਬੀ) for farmers.',
  or: 'Respond in natural, fluent Odia (ଓଡ଼ିଆ) for farmers.',
  hinglish: 'Respond in natural conversational Hinglish (Roman Hindi + English).',
  en: 'Respond in clear, professional, farmer-friendly English.',
};

export class AiService {
  private static executionLogs: AIExecutionTrace[] = [];

  static getExecutionLogs(): AIExecutionTrace[] {
    return [...this.executionLogs];
  }

  static getLatestTrace(): AIExecutionTrace | undefined {
    return this.executionLogs[this.executionLogs.length - 1];
  }

  /**
   * Helper to detect intent and resolve structured card
   */
  private static async resolveCardForQuery(query: string): Promise<{ card?: StructuredCardData; toolName?: string; toolSummary?: string; intent: string }> {
    const q = query.toLowerCase();
    let card: StructuredCardData | undefined;
    let toolName: string | undefined;
    let toolSummary: string | undefined;
    let intent = 'general_advisory';

    if (q.includes('capacity') || q.includes('maal') || q.includes('store') || q.includes('jagah') || q.includes('kitna rakh')) {
      intent = 'storage_capacity';
      toolName = 'calculate_storage_capacity()';
      const cap = await AiPlatformTools.calculate_storage_capacity();
      toolSummary = `Total: ${cap.totalCapacityKg}kg, Used: ${cap.currentLoadKg}kg, Available: ${cap.physicalAvailableKg}kg`;
      card = {
        type: 'STORAGE_CAPACITY',
        title: 'Storage Capacity Recommendation',
        titleHi: 'अनुशंसित भंडारण क्षमता',
        statusBadge: {
          text: cap.status === 'SAFE_TO_STORE' ? 'SAFE TO STORE' : 'NEAR CAPACITY',
          textHi: 'सुरक्षित भंडारण',
          variant: cap.status === 'SAFE_TO_STORE' ? 'success' : 'warning',
        },
        metrics: [
          { label: 'Recommended Additional', labelHi: 'अनुशंसित अतिरिक्त', value: `${cap.energySafeRecommendedKg} kg`, icon: 'plus-box', color: '#16a34a' },
          { label: 'Current Space Left', labelHi: 'उपलब्ध खाली स्थान', value: `${cap.physicalAvailableKg} kg`, icon: 'package-variant', color: '#0284c7' },
          { label: 'Current Stored Load', labelHi: 'वर्तमान लोड', value: `${cap.currentLoadKg} / ${cap.totalCapacityKg} kg`, icon: 'scale', color: '#64748b' },
          { label: 'Energy Headroom', labelHi: 'ऊर्जा मार्जिन', value: '+12.2 kWh', icon: 'flash', color: '#eab308' },
        ],
        highlightText: 'Energy conditions support 180 kg additional pull-down load without grid power.',
        highlightTextHi: 'बिना ग्रिड बिजली के 180 kg अतिरिक्त भार सुरक्षित रूप से ठंडा हो सकता है।',
        ctas: [
          { label: 'View Storage Chamber', labelHi: 'कोल्ड स्टोरेज देखें', action: 'NAVIGATE', targetScreen: 'STORAGE' },
          { label: 'Manage Inventory', labelHi: 'इन्वेंट्री प्रबंधित करें', action: 'NAVIGATE', targetScreen: 'INVENTORY' },
        ],
      };
    } else if (q.includes('forecast') || q.includes('solar') || q.includes('bijli') || q.includes('energy') || q.includes('surplus')) {
      intent = 'energy_forecast';
      toolName = 'predict_energy_forecast()';
      const fc = await AiPlatformTools.predict_energy_forecast();
      toolSummary = `Tomorrow: ${fc.tomorrowGenerationKwh} kWh, Demand: ${fc.tomorrowDemandKwh} kWh`;
      card = {
        type: 'ENERGY_FORECAST',
        title: 'Tomorrow’s ML Energy Forecast',
        titleHi: 'कल का ऊर्जा पूर्वानुमान',
        statusBadge: {
          text: 'EXCELLENT SURPLUS',
          textHi: 'उत्कृष्ट सरप्लस',
          variant: 'success',
        },
        metrics: [
          { label: 'Predicted Generation', labelHi: 'अनुमानित उत्पादन', value: `${fc.tomorrowGenerationKwh} kWh`, icon: 'weather-sunny', color: '#16a34a' },
          { label: 'Expected Demand', labelHi: 'शीतलन मांग', value: `${fc.tomorrowDemandKwh} kWh`, icon: 'snowflake', color: '#0284c7' },
          { label: 'Net Clean Surplus', labelHi: 'शुद्ध सरप्लस', value: `+${fc.surplusKwh} kWh`, icon: 'flash', color: '#eab308' },
          { label: 'Expected Battery SOC', labelHi: 'बैटरी चार्ज', value: `${fc.batteryExpectedSoc}%`, icon: 'battery-charging', color: '#10b981' },
        ],
        highlightText: fc.weatherCondition,
        highlightTextHi: 'धूप व निरंतर हवा (8.6 m/s) के साथ अनुकूल मौसम।',
        ctas: [
          { label: 'View Energy Analytics', labelHi: 'ऊर्जा ग्राफ देखें', action: 'NAVIGATE', targetScreen: 'ENERGY' },
        ],
      };
    } else if (q.includes('battery') || q.includes('backup') || q.includes('soc') || q.includes('charge')) {
      intent = 'battery';
      toolName = 'get_battery_status()';
      const batt = await AiPlatformTools.get_battery_status();
      toolSummary = `SOC: ${batt.batteryLevelPercentage}%, Voltage: ${batt.batteryVoltage}V`;
      card = {
        type: 'BATTERY_STATUS',
        title: 'LiFePO4 Battery Status',
        titleHi: 'बैटरी बैकअप स्थिति',
        statusBadge: {
          text: 'HEALTHY & CHARGING',
          textHi: 'सुरक्षित व चार्जिंग',
          variant: 'success',
        },
        metrics: [
          { label: 'Battery Level (SOC)', labelHi: 'बैटरी स्तर', value: `${batt.batteryLevelPercentage}%`, icon: 'battery-80', color: '#16a34a' },
          { label: 'Pack Voltage', labelHi: 'वोल्टेज', value: `${batt.batteryVoltage} V`, icon: 'flash', color: '#0284c7' },
          { label: 'Autonomous Reserve', labelHi: 'बैकअप समय', value: batt.autonomousBackupHours, icon: 'clock-outline', color: '#10b981' },
          { label: 'Battery Temp', labelHi: 'तापमान', value: `${batt.batteryTemp} °C`, icon: 'thermometer', color: '#64748b' },
        ],
        highlightText: batt.recommendedUsage,
        highlightTextHi: 'बैटरी 84% पर सुरक्षित है और पवन ऊर्जा से चार्ज हो रही है।',
        ctas: [
          { label: 'View Battery Telemetry', labelHi: 'बैटरी विवरण देखें', action: 'NAVIGATE', targetScreen: 'ENERGY' },
        ],
      };
    } else if (q.includes('fresh') || q.includes('spoil') || q.includes('kharab') || q.includes('shelf') || q.includes('sell') || q.includes('mandi')) {
      intent = 'spoilage_risk';
      toolName = 'get_spoilage_risk()';
      const sp = await AiPlatformTools.get_spoilage_risk();
      toolSummary = `Overall Risk: ${sp.overallRiskPercentage}%`;
      card = {
        type: 'SPOILAGE_ALERT',
        title: 'AI Freshness & Mandi Advisory',
        titleHi: 'ताजगी व मंडी निकासी सलाह',
        statusBadge: {
          text: 'ATTENTION NEEDED',
          textHi: 'फूलगोभी ध्यान दें',
          variant: 'warning',
        },
        metrics: [
          { label: 'Overall Risk Index', labelHi: 'कुल जोखिम', value: `${sp.overallRiskPercentage}% (Low)`, icon: 'shield-check', color: '#16a34a' },
          { label: 'Cauliflower Freshness', labelHi: 'फूलगोभी ताजगी', value: '76% (6 Days left)', icon: 'alert-circle', color: '#eab308' },
          { label: 'Tomato Freshness', labelHi: 'टमाटर ताजगी', value: '92% (8 Days left)', icon: 'check-circle', color: '#10b981' },
          { label: 'Ethylene Level', labelHi: 'एथिलीन गैस', value: `${sp.chamberAtmosphere.ethylenePpm} ppm`, icon: 'molecule', color: '#64748b' },
        ],
        highlightText: 'Action Recommended: Sell Cauliflower first within 3 days to avoid moisture loss.',
        highlightTextHi: 'सुझाव: नमी घटने से पहले फूलगोभी को अगले 3 दिनों में मंडी भेजें।',
        ctas: [
          { label: 'View Inventory Batches', labelHi: 'फसल इन्वेंट्री देखें', action: 'NAVIGATE', targetScreen: 'INVENTORY' },
        ],
      };
    } else if (q.includes('temp') || q.includes('humidity') || q.includes('safe') || q.includes('status') || q.includes('tapman') || q.includes('nami')) {
      intent = 'storage_status';
      toolName = 'get_current_storage_status()';
      const st = await AiPlatformTools.get_current_storage_status();
      toolSummary = `Temp: ${st.temperature}°C, RH: ${st.humidity}%, Health: ${st.healthPercentage}%`;
      card = {
        type: 'STORAGE_HEALTH',
        title: 'Storage Health & Telemetry',
        titleHi: 'कोल्ड स्टोरेज स्वास्थ्य स्थिति',
        statusBadge: {
          text: 'SYSTEM SAFE',
          textHi: 'प्रणाली सुरक्षित',
          variant: 'success',
        },
        metrics: [
          { label: 'Core Temperature', labelHi: 'तापमान', value: `${st.temperature} °C`, icon: 'thermometer', color: '#16a34a' },
          { label: 'Relative Humidity', labelHi: 'नमी', value: `${st.humidity} %`, icon: 'water-percent', color: '#0284c7' },
          { label: 'Battery Reserve', labelHi: 'बैटरी', value: `${st.batteryPercentage} %`, icon: 'battery', color: '#10b981' },
          { label: 'Chamber Load', labelHi: 'वर्तमान लोड', value: `${st.currentLoadKg} kg`, icon: 'scale', color: '#64748b' },
        ],
        ctas: [
          { label: 'View Storage Screen', labelHi: 'कोल्ड स्टोरेज देखें', action: 'NAVIGATE', targetScreen: 'STORAGE' },
        ],
      };
    } else if (q.includes('inventory') || q.includes('crop') || q.includes('sabzi') || q.includes('produce')) {
      intent = 'inventory';
      toolName = 'get_inventory()';
      const inv = await AiPlatformTools.get_inventory();
      toolSummary = `Batches: ${inv.totalBatches}, Weight: ${inv.totalWeightKg}kg`;
      card = {
        type: 'INVENTORY_SUMMARY',
        title: 'Stored Crop Inventory',
        titleHi: 'भंडारित फसल इन्वेंट्री',
        statusBadge: {
          text: `${inv.totalWeightKg} KG STORED`,
          textHi: `${inv.totalWeightKg} किग्रा भंडारित`,
          variant: 'info',
        },
        metrics: [
          { label: 'Total Weight', labelHi: 'कुल वजन', value: `${inv.totalWeightKg} kg`, icon: 'scale', color: '#16a34a' },
          { label: 'Est. Market Value', labelHi: 'अनुमानित मूल्य', value: `₹${inv.totalValueInr.toLocaleString('en-IN')}`, icon: 'currency-inr', color: '#0284c7' },
          { label: 'Active Batches', labelHi: 'सक्रिय बैच', value: `${inv.totalBatches} Crops`, icon: 'basket', color: '#10b981' },
          { label: 'Space Remaining', labelHi: 'खाली जगह', value: `${500 - inv.totalWeightKg} kg`, icon: 'package-variant', color: '#64748b' },
        ],
        ctas: [
          { label: 'Open Inventory Manager', labelHi: 'इन्वेंट्री खोलें', action: 'NAVIGATE', targetScreen: 'INVENTORY' },
        ],
      };
    }

    return { card, toolName, toolSummary, intent };
  }

  /**
   * Real-Time Progressive Streaming AI Assistant Query with Real Gemini API
   */
  static async queryAssistantStream(
    userQuery: string,
    forcedLanguage: LanguageCode | undefined,
    history: AIMessage[],
    callbacks: StreamCallbacks,
    abortSignal?: AbortSignal,
    isVoice: boolean = false,
    voiceMetrics?: { sttLatencyMs?: number; voiceTranscript?: string }
  ): Promise<void> {
    const startTime = Date.now();
    const lang = forcedLanguage || 'en';

    // 1. Resolve structured telemetry card for intent
    const { card, toolName, toolSummary, intent } = await this.resolveCardForQuery(userQuery);
    if (card && callbacks.onCard) {
      callbacks.onCard(card);
    }

    const baseUrl = (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_BASE_URL) || '';
    let fullResponseText = '';
    let usedModel = 'gemini-2.5-flash (OJAS Serverless)';
    let streamSucceeded = false;

    // A. Stream via Secure Vercel Serverless /api/ai Endpoint
    const apiEndpoints = [
      '/api/ai',
      baseUrl ? `${baseUrl}/api/ai` : null,
      baseUrl ? `${baseUrl}/api/ai/chat/stream` : null,
    ].filter(Boolean) as string[];

    const payloadHistory = history.slice(-6).map((m) => ({
      sender: m.sender,
      text: m.text,
    }));

    for (const endpoint of apiEndpoints) {
      if (streamSucceeded || abortSignal?.aborted) break;

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
          },
          body: JSON.stringify({
            query: userQuery,
            language: lang,
            history: payloadHistory,
          }),
          signal: abortSignal,
        });

        if (response.ok && response.body) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder('utf-8');
          let buffer = '';

          while (true) {
            if (abortSignal?.aborted) {
              reader.cancel();
              break;
            }

            const { value, done } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const jsonStr = line.slice(6).trim();
                if (!jsonStr) continue;

                try {
                  const data = JSON.parse(jsonStr);
                  if (data.done) break;
                  if (data.chunk) {
                    fullResponseText += data.chunk;
                    callbacks.onChunk(data.chunk, fullResponseText);
                  }
                  if (data.model) {
                    usedModel = `${data.model} (Serverless Live)`;
                  }
                } catch {
                  // Ignore parse errors on split packets
                }
              }
            }
          }

          if (fullResponseText.trim().length > 0) {
            streamSucceeded = true;
            break;
          }
        }
      } catch {
        // Try next endpoint or fallback to edge telemetry
        continue;
      }
    }

    // B. Local Offline Edge Fallback if offline
    if (!streamSucceeded && !abortSignal?.aborted) {
      usedModel = 'OJAS-Edge-Offline';
      const localResponse = this.generateLocalFallback(intent, lang);
      const words = localResponse.split(' ');
      fullResponseText = '';
      for (let i = 0; i < words.length; i++) {
        if (abortSignal?.aborted) break;
        fullResponseText += (i === 0 ? '' : ' ') + words[i];
        callbacks.onChunk(words[i] + ' ', fullResponseText);
        await new Promise((r) => setTimeout(r, 20));
      }
    }

    // D. Local Offline Fallback
    if (!streamSucceeded && !abortSignal?.aborted) {
      usedModel = 'OJAS-Edge-Offline';
      const localResponse = this.generateLocalFallback(intent, lang);
      const words = localResponse.split(' ');
      fullResponseText = '';
      for (let i = 0; i < words.length; i++) {
        if (abortSignal?.aborted) break;
        fullResponseText += (i === 0 ? '' : ' ') + words[i];
        callbacks.onChunk(words[i] + ' ', fullResponseText);
        await new Promise((r) => setTimeout(r, 20));
      }
    }

    const latencyMs = Date.now() - startTime;
    const spokenText = VoiceService.formatForSpeech(fullResponseText, lang);

    const trace: AIExecutionTrace = {
      query: userQuery,
      timestamp: new Date().toLocaleTimeString(),
      detectedLanguage: lang,
      scope: 'IN_SCOPE',
      intent: intent as any,
      securityFlag: false,
      retrievedChunks: [usedModel],
      toolExecuted: toolName,
      toolResultSummary: toolSummary,
      latencyMs,
      isVoice,
      sttLatencyMs: voiceMetrics?.sttLatencyMs,
      voiceTranscript: voiceMetrics?.voiceTranscript,
      spokenResponse: spokenText,
    };

    this.executionLogs.push(trace);
    if (callbacks.onTrace) {
      callbacks.onTrace(trace);
    }
    callbacks.onDone(fullResponseText, card, trace);
  }

  /**
   * Generates localized offline answer for edge fallback
   */
  private static generateLocalFallback(intent: string, lang: LanguageCode): string {
    if (lang === 'hi') {
      return 'ओजस स्मार्ट कोल्ड स्टोरेज 4.8°C तापमान और 84% बैटरी बैकअप के साथ पूरी तरह सुरक्षित और सामान्य रूप से कार्य कर रहा है।';
    }
    if (lang === 'mr') {
      return 'ओजस स्मार्ट कोल्ड स्टोरेज 4.8°C तापमान आणि 84% बॅटरी बॅकअपसह सुरळीत आणि सुरक्षितपणे सुरू आहे.';
    }
    if (lang === 'bn') {
      return 'ওজস স্মার্ট কোল্ড স্টোরেজ 4.8°C তাপমাত্রা এবং 84% ব্যাটারি ব্যাকআপ সহ স্বাভাবিকভাবে চলছে।';
    }
    if (lang === 'hinglish') {
      return 'OJAS Cold Storage 4.8°C temp aur 84% battery backup ke saath smoothly function kar raha hai.';
    }
    return 'OJAS Smart Cold Storage is operating normally at 4.8°C with 84% battery backup reserve.';
  }

  /**
   * Complete Non-Streaming Assistant Query
   */
  static async queryAssistant(
    userQuery: string,
    forcedLanguage?: LanguageCode,
    isVoice: boolean = false,
    voiceMetrics?: { sttLatencyMs?: number; voiceTranscript?: string }
  ): Promise<{ text: string; card?: StructuredCardData; spokenText?: string; trace: AIExecutionTrace }> {
    return new Promise((resolve, reject) => {
      let finalCard: StructuredCardData | undefined;
      let finalTrace: AIExecutionTrace | undefined;

      this.queryAssistantStream(
        userQuery,
        forcedLanguage,
        [],
        {
          onChunk: () => {},
          onCard: (c) => (finalCard = c),
          onTrace: (t) => (finalTrace = t),
          onDone: (text, card, trace) => {
            resolve({
              text,
              card: card || finalCard,
              spokenText: trace?.spokenResponse || VoiceService.formatForSpeech(text, trace?.detectedLanguage || 'en'),
              trace: trace || finalTrace!,
            });
          },
          onError: (err) => reject(err),
        },
        undefined,
        isVoice,
        voiceMetrics
      );
    });
  }
}
