import { LanguageCode } from '../types/user';
import { VoiceState } from '../types/ai';

export class VoiceService {
  private static recognition: any = null;
  private static isListening: boolean = false;
  private static isSpeaking: boolean = false;
  private static currentUtterance: SpeechSynthesisUtterance | null = null;

  /**
   * Cleans AI text into a speech-friendly, natural vocalization format
   */
  static formatForSpeech(rawText: string, language: LanguageCode = 'en'): string {
    if (!rawText) return '';

    let text = rawText;

    // 1. Remove markdown links, images, bold, italics, headers, bullets
    text = text.replace(/!\[.*?\]\(.*?\)/g, ''); // images
    text = text.replace(/\[(.*?)\]\(.*?\)/g, '$1'); // links
    text = text.replace(/[*#_`~>]/g, ''); // formatting symbols
    text = text.replace(/\n+/g, ' '); // newlines to spaces
    text = text.replace(/•|\-/g, ''); // bullets

    // 2. Remove emojis for natural TTS flow
    text = text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');

    // 3. Expand abbreviations and technical symbols based on language
    if (language === 'hi') {
      text = text.replace(/(\d+(\.\d+)?)\s*kWh/gi, '$1 किलोवाट घंटे');
      text = text.replace(/(\d+(\.\d+)?)\s*kW/gi, '$1 किलोवाट');
      text = text.replace(/(\d+(\.\d+)?)\s*°C/gi, '$1 डिग्री सेल्सियस');
      text = text.replace(/(\d+(\.\d+)?)\s*kg/gi, '$1 किलो');
      text = text.replace(/₹\s*(\d+)/gi, '$1 रुपये');
      text = text.replace(/\bSOC\b/gi, 'बैटरी चार्ज स्तर');
      text = text.replace(/\bVAWT\b/gi, 'पवन चक्की');
      text = text.replace(/\bRH\b/gi, 'आर्द्रता');
    } else if (language === 'hinglish') {
      text = text.replace(/(\d+(\.\d+)?)\s*kWh/gi, '$1 unit bijli');
      text = text.replace(/(\d+(\.\d+)?)\s*kW/gi, '$1 kilowatt');
      text = text.replace(/(\d+(\.\d+)?)\s*°C/gi, '$1 degree Celsius');
      text = text.replace(/(\d+(\.\d+)?)\s*kg/gi, '$1 kg');
      text = text.replace(/₹\s*(\d+)/gi, '$1 rupaye');
      text = text.replace(/\bSOC\b/gi, 'battery level');
      text = text.replace(/\bVAWT\b/gi, 'wind turbine');
    } else {
      text = text.replace(/(\d+(\.\d+)?)\s*kWh/gi, '$1 kilowatt hours');
      text = text.replace(/(\d+(\.\d+)?)\s*kW/gi, '$1 kilowatts');
      text = text.replace(/(\d+(\.\d+)?)\s*°C/gi, '$1 degrees Celsius');
      text = text.replace(/(\d+(\.\d+)?)\s*kg/gi, '$1 kilograms');
      text = text.replace(/₹\s*(\d+)/gi, '$1 rupees');
      text = text.replace(/\bSOC\b/gi, 'state of charge');
      text = text.replace(/\bVAWT\b/gi, 'wind turbine');
      text = text.replace(/\bRH\b/gi, 'relative humidity');
    }

    // 4. Normalize spaces
    text = text.replace(/\s+/g, ' ').trim();

    return text;
  }

  /**
   * Initializes browser SpeechRecognition if available
   */
  private static getSpeechRecognition(): any {
    if (typeof window === 'undefined') return null;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    if (!this.recognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 1;
    }
    return this.recognition;
  }

  /**
   * Starts listening to user speech via microphone
   */
  static startListening(options: {
    language?: LanguageCode;
    onResult: (transcript: string) => void;
    onStateChange?: (state: VoiceState) => void;
    onError?: (errorMsg: string) => void;
  }): boolean {
    // Interruption: stop any playing speech
    this.stopSpeaking();

    const recognizer = this.getSpeechRecognition();

    if (!recognizer) {
      if (options.onError) {
        options.onError('Browser Speech Recognition not supported. Use quick voice prompts below.');
      }
      return false;
    }

    try {
      if (options.language === 'hi') {
        recognizer.lang = 'hi-IN';
      } else {
        // Hinglish / English
        recognizer.lang = 'en-IN';
      }

      this.isListening = true;
      if (options.onStateChange) options.onStateChange('LISTENING');

      recognizer.onresult = (event: any) => {
        this.isListening = false;
        if (options.onStateChange) options.onStateChange('PROCESSING');

        const transcript = event.results[0][0].transcript;
        if (transcript) {
          options.onResult(transcript);
        }
      };

      recognizer.onerror = (event: any) => {
        this.isListening = false;
        if (options.onStateChange) options.onStateChange('IDLE');
        if (options.onError) {
          if (event.error === 'not-allowed') {
            options.onError('Microphone access denied. Please allow microphone permissions.');
          } else if (event.error === 'no-speech') {
            options.onError('No speech detected. Please tap and speak again.');
          } else {
            options.onError(`Speech recognition error: ${event.error}`);
          }
        }
      };

      recognizer.onend = () => {
        this.isListening = false;
      };

      recognizer.start();
      return true;
    } catch (err: any) {
      this.isListening = false;
      if (options.onStateChange) options.onStateChange('IDLE');
      if (options.onError) options.onError(err?.message || 'Failed to start microphone');
      return false;
    }
  }

  /**
   * Stops active microphone listening
   */
  static stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // Ignore stop error
      }
      this.isListening = false;
    }
  }

  /**
   * Vocalizes text using Web SpeechSynthesis API
   */
  static speak(
    rawText: string,
    options: {
      language?: LanguageCode;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: () => void;
    }
  ): void {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      if (options.onEnd) options.onEnd();
      return;
    }

    // Stop any current utterance
    this.stopSpeaking();

    const speechText = this.formatForSpeech(rawText, options.language);
    if (!speechText) {
      if (options.onEnd) options.onEnd();
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(speechText);
      this.currentUtterance = utterance;

      const langCode = options.language === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.lang = langCode;
      utterance.rate = options.language === 'hi' ? 0.95 : 1.0;
      utterance.pitch = 1.0;

      // Select matching voice
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const matchingVoice = voices.find(v => 
          v.lang.toLowerCase().includes(langCode.toLowerCase()) ||
          (options.language === 'hi' ? v.lang.includes('hi') : v.lang.includes('en'))
        );
        if (matchingVoice) {
          utterance.voice = matchingVoice;
        }
      }

      utterance.onstart = () => {
        this.isSpeaking = true;
        if (options.onStart) options.onStart();
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.currentUtterance = null;
        if (options.onEnd) options.onEnd();
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
        this.currentUtterance = null;
        if (options.onError) options.onError();
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (options.onEnd) options.onEnd();
    }
  }

  /**
   * Stops any ongoing assistant voice speech (Barge-in / Interruption)
   */
  static stopSpeaking(): void {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore cancel error
      }
    }
    this.isSpeaking = false;
    this.currentUtterance = null;
  }

  /**
   * Checks if audio is currently speaking
   */
  static getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  /**
   * Checks if microphone is actively listening
   */
  static getIsListening(): boolean {
    return this.isListening;
  }
}
