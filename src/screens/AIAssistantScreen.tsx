import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Image, Animated, Easing } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';
import { AiService } from '../services/aiService';
import { VoiceService } from '../services/voiceService';
import { AIMessage, StructuredCardData, AIExecutionTrace, AIMode, VoiceState } from '../types/ai';
import { LanguageCode } from '../types/user';
import AIObservabilityModal from '../components/AIObservabilityModal';

const DOMAIN_SUGGESTED_CHIPS = [
  { id: 'storage-safe', labelKey: 'aiChipSafe', query: 'Cold storage safe hai kya?' },
  { id: 'capacity-rec', labelKey: 'aiChipCapacity', query: 'Kal kitna maal rakh sakte hain?' },
  { id: 'solar-forecast', labelKey: 'aiChipSolar', query: 'Kal kitni bijli banegi?' },
  { id: 'battery-check', labelKey: 'aiChipBattery', query: 'Battery kitni hai?' },
  { id: 'inventory-show', labelKey: 'aiChipVegetables', query: 'Show my stored vegetables' },
  { id: 'spoilage-advice', labelKey: 'aiChipSpoilage', query: 'Tomato kitne din tak fresh rahega?' },
  { id: 'how-works', labelKey: 'aiChipWork', query: 'How does your cold storage work?' },
];

const VOICE_PRESET_QUERIES = [
  { id: 'v1', text: 'Kal kitna maal rakh sakte hain?', textHi: 'कल कितना माल रख सकते हैं?', label: '📦 Storage Capacity' },
  { id: 'v2', text: 'Kal kitni bijli banegi?', textHi: 'कल कितनी बिजली बनेगी?', label: '☀️ Solar Forecast' },
  { id: 'v3', text: 'Battery kitni bachi hai?', textHi: 'बैटरी कितनी बची है?', label: '🔋 Battery Backup' },
  { id: 'v4', text: 'Cold storage safe hai kya?', textHi: 'क्या कोल्ड स्टोरेज सुरक्षित है?', label: '🛡 Storage Safety' },
  { id: 'v5', text: 'Tomato kitne din tak fresh rahega?', textHi: 'टमाटर कितने दिन तक फ्रेश रहेगा?', label: '🍅 Crop Freshness' },
];

interface AIAssistantScreenProps {
  language?: LanguageCode;
  onNavigate?: (screenName: string) => void;
}

export default function AIAssistantScreen({
  language: propLanguage,
  onNavigate,
}: AIAssistantScreenProps) {
  const { theme } = useTheme();
  const { language: ctxLanguage, t } = useLanguage();
  const language = propLanguage || ctxLanguage;

  // Mode selection: TEXT vs VOICE
  const [activeMode, setActiveMode] = useState<AIMode>('TEXT');
  const activeModeRef = useRef<AIMode>('TEXT');

  useEffect(() => {
    activeModeRef.current = activeMode;
  }, [activeMode]);

  // Shared Conversation History
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'ai',
      text:
        language === 'hi'
          ? 'नमस्ते किसान भाई! मैं आपका स्मार्ट कोल्ड स्टोरेज सहायक हूँ। अपने कोल्ड स्टोरेज, सौर/पवन ऊर्जा पूर्वानुमान, बैटरी बैकअप, या अनुशंसित भंडारण क्षमता के बारे में पूछें।'
          : language === 'mr'
          ? 'नमस्कार शेतकरी बांधव! मी आपला ओजस स्मार्ट कोल्ड स्टोरेज एआय सहाय्यक आहे. तापमान, सौर/पवन ऊर्जा अंदाज, बॅटरी बॅकअप किंवा भाजीपाला साठ्याबद्दल विचारा.'
          : language === 'bn'
          ? 'নমস্কার কৃষক বন্ধু! আমি আপনার স্মার্ট কোল্ড স্টোরেজ এআই সহায়ক। তাপমাত্রা, বিদ্যুৎ পূর্বাভাস বা ফসল সংরক্ষণ সম্পর্কে জিজ্ঞাসা করুন।'
          : language === 'te'
          ? 'నమస్కారం రైతు సోదరా! నేను మీ స్మార్ట్ కోల్డ్ స్టోరేజ్ ఏఐ సహాయకుడిని. ఉష్ణోగ్రత, విద్యుత్ అంచనా లేదా పంట నిల్వ గురించి అడగండి.'
          : language === 'ta'
          ? 'வணக்கம் விவசாய தோழரே! நான் உங்கள் ஸ்மார்ட் குளிர்சாதன AI உதவியாளர். வெப்பநிலை, மின்சாரம் அல்லது பயிர் பாதுகாப்பு பற்றி கேளுங்கள்.'
          : language === 'gu'
          ? 'નમસ્તે ખેડૂત મિત્ર! હું તમારો સ્માર્ટ કોલ્ડ સ્ટોરેજ AI સહાયક છું. તાપમાન, વીજળીની આગાહી અથવા પાક સંગ્રહ વિશે પૂછો.'
          : language === 'kn'
          ? 'ನಮಸ್ಕಾರ ರೈತ ಮಿತ್ರರೇ! ನಾನು ನಿಮ್ಮ ಸ್ಮಾರ್ಟ್ ಕೋಲ್ಡ್ ಸ್ಟೋರೇಜ್ AI ಸಹಾಯಕ. ತಾಪಮಾನ, ವಿದ್ಯುತ್ ಮುನ್ಸೂಚನೆ ಅಥವಾ ಬೆಳೆ ಸಂಗ್ರಹಣೆ ಬಗ್ಗೆ ಕೇಳಿ.'
          : language === 'ml'
          ? 'നമസ്കാരം കർഷക സുഹൃത്തേ! ഞാൻ നിങ്ങളുടെ സ്മാർട്ട് കോൾഡ് സ്റ്റോറേജ് AI സഹായിയാണ്. താപനില, വൈദ്യുതി പ്രവചനം അല്ലെങ്കിൽ വിള സംഭരണം എന്നിവ ചോദിക്കൂ.'
          : language === 'pa'
          ? 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਵੀਰੋ! ਮੈਂ ਤੁਹਾਡਾ ਸਮਾਰਟ ਕੋਲਡ ਸਟੋਰੇਜ AI ਸਹਾਇਕ ਹਾਂ। ਤਾਪਮਾਨ, ਬਿਜਲੀ ਅਨੁਮਾਨ ਜਾਂ ਫਸਲ ਸਟੋਰੇਜ ਬਾਰੇ ਪੁੱਛੋ।'
          : language === 'or'
          ? 'ନମସ୍କାର ଚାଷୀ ଭାଇ! ମୁଁ ଆପଣଙ୍କ ସ୍ମାର୍ଟ କୋଲ୍ଡ ଷ୍ଟୋରେଜ୍ AI ସହାୟକ। ତାପମାତ୍ରା, ବିଦ୍ୟୁତ୍ ଆକଳନ କିମ୍ବା ଫସଲ ସଂରକ୍ଷଣ ବିଷୟରେ ପଚାରନ୍ତୁ।'
          : language === 'hinglish'
          ? 'Namaste Kisan Bhai! Main aapka Smart Cold Storage AI Assistant hoon. Cold storage status, kal ki bijli forecast, battery backup ya kitna maal store karein ke baare me poochhein.'
          : 'Hello! I am your Smart Cold Storage AI Assistant. Ask me about real-time cold room status, solar/wind energy forecasting, battery backup, or recommended storage capacity.',
      timestamp: 'Just now',
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isObservabilityOpen, setIsObservabilityOpen] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<AIExecutionTrace[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Voice Mode State
  const [voiceState, setVoiceState] = useState<VoiceState>('IDLE');
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const [voiceStatusNote, setVoiceStatusNote] = useState<string>('Tap microphone to speak (बोलिए...)');
  const [isTTSMuted, setIsTTSMuted] = useState<boolean>(false);

  const getWelcomeText = (lang: LanguageCode) => {
    switch (lang) {
      case 'hi':
        return 'नमस्ते किसान भाई! मैं आपका स्मार्ट कोल्ड स्टोरेज सहायक हूँ। अपने कोल्ड स्टोरेज, सौर/पवन ऊर्जा पूर्वानुमान, बैटरी बैकअप, या अनुशंसित भंडारण क्षमता के बारे में पूछें।';
      case 'mr':
        return 'नमस्कार शेतकरी बांधव! मी आपला ओजस स्मार्ट कोल्ड स्टोरेज एआय सहाय्यक आहे. तापमान, सौर/पवन ऊर्जा अंदाज, बॅटरी बॅकअप किंवा भाजीपाला साठ्याबद्दल विचारा.';
      case 'bn':
        return 'নমস্কার কৃষক বন্ধু! আমি আপনার স্মার্ট কোল্ড স্টোরেজ এআই সহায়ক। তাপমাত্রা, বিদ্যুৎ পূর্বাভাস বা ফসল সংরক্ষণ সম্পর্কে জিজ্ঞাসা করুন।';
      case 'te':
        return 'నమస్కారం రైతు సోదరా! నేను మీ స్మార్ట్ కోల్డ్ స్టోరేజ్ ఏఐ సహాయకుడిని. ఉష్ణోగ్రత, విద్యుత్ అంచనా లేదా పంట నిల్వ గురించి అడగండి.';
      case 'ta':
        return 'வணக்கம் விவசாய தோழரே! நான் உங்கள் ஸ்மார்ட் குளிர்சாதன AI உதவியாளர். வெப்பநிலை, மின்சாரம் அல்லது பயிர் பாதுகாப்பு பற்றி கேளுங்கள்.';
      case 'gu':
        return 'નમસ્તે ખેડૂત મિત્ર! હું તમારો સ્માર્ટ કોલ્ડ સ્ટોરેજ AI સહાયક છું. તાપમાન, વીજળીની આગાહી અથવા પાક સંગ્રહ વિશે પૂછો.';
      case 'kn':
        return 'ನಮಸ್ಕಾರ ರೈತ ಮಿತ್ರರೇ! ನಾನು ನಿಮ್ಮ ಸ್ಮಾರ್ಟ್ ಕೋಲ್ಡ್ ಸ್ಟೋರೇಜ್ AI ಸಹಾಯಕ. ತಾಪಮಾನ, ವಿದ್ಯುತ್ ಮುನ್ಸೂಚನೆ ಅಥವಾ ಬೆಳೆ ಸಂಗ್ರಹಣೆ ಬಗ್ಗೆ ಕೇಳಿ.';
      case 'ml':
        return 'നമസ്കാരം കർഷക സുഹൃത്തേ! ഞാൻ നിങ്ങളുടെ സ്മാർട്ട് കോൾഡ് സ്റ്റോറേജ് AI സഹായിയാണ്. താപനില, വൈദ്യുതി പ്രവചനം അല്ലെങ്കിൽ വിള സംഭരണം എന്നിവ ചോദിക്കൂ.';
      case 'pa':
        return 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਵੀਰੋ! ਮੈਂ ਤੁਹਾਡਾ ਸਮਾਰਟ ਕੋਲਡ ਸਟੋਰੇਜ AI ਸਹਾਇਕ ਹਾਂ। ਤਾਪਮਾਨ, ਬਿਜਲੀ ਅਨੁਮਾਨ ਜਾਂ ਫਸਲ ਸਟੋਰੇਜ ਬਾਰੇ ਪੁੱਛੋ।';
      case 'or':
        return 'ନମସ୍କାର ଚାଷୀ ଭାଇ! ମୁଁ ଆପଣଙ୍କ ସ୍ମାର୍ଟ କୋଲ୍ଡ ଷ୍ଟୋରେଜ୍ AI ସହାୟକ। ତାପମାତ୍ରା, ବିଦ୍ୟୁତ୍ ଆକଳନ କିମ୍ବା ଫସଲ ସଂରକ୍ଷଣ ବିଷୟରେ ପଚାରନ୍ତୁ।';
      case 'hinglish':
        return 'Namaste Kisan Bhai! Main aapka Smart Cold Storage AI Assistant hoon. Cold storage status, kal ki bijli forecast, battery backup ya kitna maal store karein ke baare me poochhein.';
      default:
        return 'Hello! I am your Smart Cold Storage AI Assistant. Ask me about real-time cold room status, solar/wind energy forecasting, battery backup, or recommended storage capacity.';
    }
  };

  // Sync welcome message on language change
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome-msg') {
        return [{ ...prev[0], text: getWelcomeText(language) }];
      }
      return prev;
    });
  }, [language]);

  // Pulse animations for Voice Orb
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (voiceState === 'LISTENING' || voiceState === 'SPEAKING') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.timing(rippleAnim, {
          toValue: 1,
          duration: 1400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        })
      ).start();
    } else {
      pulseAnim.setValue(1);
      rippleAnim.setValue(0);
    }
  }, [voiceState]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      VoiceService.stopListening();
      VoiceService.stopSpeaking();
    };
  }, []);

  /**
   * Stop Active AI Response Generation
   */
  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setIsTyping(false);
    if (voiceState === 'PROCESSING') {
      setVoiceState('IDLE');
      setVoiceStatusNote('Generation stopped.');
    }
  };

  /**
   * Unified Query Processing Pipeline with Real-Time Progressive Streaming
   */
  const processQuery = async (
    queryText: string,
    isVoiceQuery: boolean = false,
    sttDurationMs?: number
  ) => {
    const textToSend = queryText.trim();
    if (!textToSend) return;

    // Stop any existing stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const userMsgId = Date.now().toString();
    const userMsg: AIMessage = {
      id: userMsgId,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const aiMsgId = (Date.now() + 1).toString();
    const initialAiMsg: AIMessage = {
      id: aiMsgId,
      sender: 'ai',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg, initialAiMsg]);
    setInputQuery('');
    setIsTyping(true);
    setIsStreaming(true);

    if (isVoiceQuery) {
      setVoiceState('PROCESSING');
      setVoiceStatusNote('Checking IoT telemetry & streaming Gemini response...');
    }

    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 80);

    let streamFullText = '';
    let finalCardData: StructuredCardData | undefined;

    try {
      await AiService.queryAssistantStream(
        textToSend,
        language,
        messages,
        {
          onChunk: (chunk, accumulated) => {
            setIsTyping(false);
            streamFullText = accumulated;
            setMessages((prev) =>
              prev.map((msg) => (msg.id === aiMsgId ? { ...msg, text: accumulated } : msg))
            );
            setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 50);
          },
          onCard: (card) => {
            finalCardData = card;
            setMessages((prev) =>
              prev.map((msg) => (msg.id === aiMsgId ? { ...msg, card } : msg))
            );
          },
          onTrace: (trace) => {
            setExecutionLogs(AiService.getExecutionLogs());
          },
          onDone: (finalText, card, trace) => {
            setIsStreaming(false);
            setIsTyping(false);
            abortControllerRef.current = null;

            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === aiMsgId
                  ? {
                      ...msg,
                      text: finalText || streamFullText,
                      card: card || finalCardData,
                      detectedLanguage: trace?.detectedLanguage,
                      intent: trace?.intent,
                      scope: trace?.scope,
                      executionTrace: trace,
                    }
                  : msg
              )
            );

            setExecutionLogs(AiService.getExecutionLogs());
            setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

            // If in Voice Mode and not muted, vocalize response
            const isVoiceModeActive = isVoiceQuery || activeModeRef.current === 'VOICE';
            if (isVoiceModeActive && !isTTSMuted) {
              const textToSpeak = trace?.spokenResponse || finalText || streamFullText;
              if (textToSpeak) {
                setVoiceState('SPEAKING');
                setVoiceStatusNote(language === 'hi' ? 'उत्तर बोल रहे हैं...' : 'Speaking response...');

                VoiceService.speak(textToSpeak, {
                  language: trace?.detectedLanguage || language,
                  onStart: () => {
                    setVoiceState('SPEAKING');
                    setVoiceStatusNote(language === 'hi' ? 'उत्तर बोल रहे हैं...' : 'Speaking response...');
                  },
                  onEnd: () => {
                    setVoiceState('IDLE');
                    setVoiceStatusNote(language === 'hi' ? 'माइक पर टैप करके पूछें' : 'Tap microphone to speak again');
                  },
                  onError: () => {
                    setVoiceState('IDLE');
                    setVoiceStatusNote(language === 'hi' ? 'माइक पर टैप करके पूछें' : 'Tap microphone to speak again');
                  },
                });
              } else {
                setVoiceState('IDLE');
                setVoiceStatusNote('Tap microphone to speak');
              }
            } else if (isVoiceQuery) {
              setVoiceState('IDLE');
              setVoiceStatusNote('Response ready. Tap microphone to speak');
            }
          },
          onError: (err) => {
            setIsStreaming(false);
            setIsTyping(false);
            abortControllerRef.current = null;
            if (isVoiceQuery) {
              setVoiceState('IDLE');
              setVoiceStatusNote('Connection interrupted. Tap microphone to retry.');
            }
          },
        },
        abortController.signal,
        isVoiceQuery,
        { sttLatencyMs: sttDurationMs, voiceTranscript: textToSend }
      );
    } catch (err) {
      setIsStreaming(false);
      setIsTyping(false);
    }
  };

  /**
   * Voice Interaction Handlers
   */
  const handleStartVoiceListening = () => {
    VoiceService.stopSpeaking();
    setVoiceState('LISTENING');
    setVoiceStatusNote('Listening... (बोलिए...)');
    setVoiceTranscript('');

    const listenStartTime = Date.now();

    const success = VoiceService.startListening({
      language,
      onResult: (transcript) => {
        const sttLatencyMs = Date.now() - listenStartTime;
        setVoiceTranscript(transcript);
        processQuery(transcript, true, sttLatencyMs);
      },
      onStateChange: (state) => {
        setVoiceState(state);
        if (state === 'LISTENING') setVoiceStatusNote('Listening... (बोलिए...)');
        if (state === 'PROCESSING') setVoiceStatusNote('Analyzing IoT telemetry & ML energy models...');
        if (state === 'IDLE') setVoiceStatusNote('Tap microphone to speak');
      },
      onError: (errMsg) => {
        setVoiceState('IDLE');
        setVoiceStatusNote(errMsg);
      },
    });

    if (!success) {
      setTimeout(() => {
        setVoiceTranscript('Kal kitna maal rakh sakte hain?');
        processQuery('Kal kitna maal rakh sakte hain?', true, 350);
      }, 1200);
    }
  };

  const handleStopVoiceListening = () => {
    VoiceService.stopListening();
    setVoiceState('IDLE');
    setVoiceStatusNote('Listening stopped. Tap microphone to speak.');
  };

  const handleBargeInStopSpeaking = () => {
    VoiceService.stopSpeaking();
    setVoiceState('IDLE');
    setVoiceStatusNote('Speech stopped. Tap microphone to speak.');
  };

  const handleVoicePresetSelect = (presetQuery: string) => {
    VoiceService.unlockAudio();
    VoiceService.stopSpeaking();
    setVoiceTranscript(presetQuery);
    processQuery(presetQuery, true, 50);
  };

  const handleRegenerateLast = () => {
    const userMsgs = messages.filter((m) => m.sender === 'user');
    if (userMsgs.length > 0) {
      const lastUserQuery = userMsgs[userMsgs.length - 1].text;
      processQuery(lastUserQuery, false);
    }
  };

  const renderStructuredCard = (card: StructuredCardData) => {
    return (
      <View style={[styles.cardContainer, { backgroundColor: theme.backgroundSubtle, borderColor: theme.border }]}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
            {language === 'hi' && card.titleHi ? card.titleHi : card.title}
          </Text>
          {card.statusBadge && (
            <View
              style={[
                styles.cardBadge,
                card.statusBadge.variant === 'success'
                  ? styles.badgeSuccess
                  : card.statusBadge.variant === 'warning'
                  ? styles.badgeWarning
                  : styles.badgeInfo,
              ]}
            >
              <Text
                style={[
                  styles.cardBadgeText,
                  card.statusBadge.variant === 'success'
                    ? styles.badgeSuccessText
                    : card.statusBadge.variant === 'warning'
                    ? styles.badgeWarningText
                    : styles.badgeInfoText,
                ]}
              >
                {language === 'hi' && card.statusBadge.textHi ? card.statusBadge.textHi : card.statusBadge.text}
              </Text>
            </View>
          )}
        </View>

        {/* Card Metrics Grid */}
        <View style={styles.metricsGrid}>
          {card.metrics.map((m, idx) => (
            <View key={idx} style={[styles.metricItem, { backgroundColor: theme.card, borderColor: theme.borderLight }]}>
              {m.icon && <MaterialCommunityIcons name={m.icon as any} size={16} color={m.color || theme.primary} />}
              <View style={{ flex: 1 }}>
                <Text style={[styles.metricLabel, { color: theme.textMuted }]}>
                  {language === 'hi' && m.labelHi ? m.labelHi : m.label}
                </Text>
                <Text style={[styles.metricValue, { color: m.color || theme.textPrimary }]}>{m.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Card Highlight Note */}
        {card.highlightText && (
          <View style={[styles.highlightBox, { backgroundColor: theme.primaryLight, borderColor: theme.primary }]}>
            <MaterialCommunityIcons name="information" size={14} color={theme.primaryDark} />
            <Text style={[styles.highlightText, { color: theme.primaryDark }]}>
              {language === 'hi' && card.highlightTextHi ? card.highlightTextHi : card.highlightText}
            </Text>
          </View>
        )}

        {/* Action CTAs */}
        {card.ctas && card.ctas.length > 0 && (
          <View style={styles.ctaRow}>
            {card.ctas.map((cta, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.ctaBtn, { backgroundColor: theme.primary }]}
                onPress={() => {
                  if (cta.action === 'NAVIGATE' && cta.targetScreen && onNavigate) {
                    onNavigate(cta.targetScreen);
                  }
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.ctaBtnText}>
                  {language === 'hi' && cta.labelHi ? cta.labelHi : cta.label} →
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  const latestAiMessage = messages.filter((m) => m.sender === 'ai').slice(-1)[0];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header Banner */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <View style={styles.headerLeft}>
          <Image source={require('../../assets/icon.png')} style={styles.headerAvatar} resizeMode="cover" />
          <View>
            <Text style={[styles.title, { color: theme.textPrimary }]}>{t('aiTitle')}</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: theme.success }]} />
              <Text style={[styles.statusText, { color: theme.textMuted }]}>
                Gemini 3.5 Flash Live (SC-001)
              </Text>
            </View>
          </View>
        </View>

        {/* AI Observability Modal Button */}
        <TouchableOpacity
          style={[styles.traceBtn, { backgroundColor: theme.primaryLight, borderColor: theme.primary }]}
          onPress={() => setIsObservabilityOpen(true)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="radar" size={15} color={theme.primary} />
          <Text style={[styles.traceBtnText, { color: theme.primaryDark }]}>AI Trace</Text>
        </TouchableOpacity>
      </View>

      {/* Mode Switcher Segment: [ 💬 Text Mode ] vs [ 🎙️ Voice Mode ] */}
      <View style={[styles.modeSwitchContainer, { backgroundColor: theme.backgroundSubtle, borderColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.modeTab, activeMode === 'TEXT' && { backgroundColor: theme.primary }]}
          onPress={() => {
            VoiceService.stopSpeaking();
            VoiceService.stopListening();
            setVoiceState('IDLE');
            setActiveMode('TEXT');
            activeModeRef.current = 'TEXT';
          }}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons
            name="message-text"
            size={16}
            color={activeMode === 'TEXT' ? '#ffffff' : theme.textSecondary}
          />
          <Text style={[styles.modeTabText, { color: activeMode === 'TEXT' ? '#ffffff' : theme.textSecondary }]}>
            {t('aiModeText')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeTab, activeMode === 'VOICE' && { backgroundColor: theme.secondary }]}
          onPress={() => {
            VoiceService.unlockAudio();
            VoiceService.stopSpeaking();
            VoiceService.stopListening();
            setVoiceState('IDLE');
            setActiveMode('VOICE');
            activeModeRef.current = 'VOICE';
          }}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons
            name="microphone"
            size={16}
            color={activeMode === 'VOICE' ? '#ffffff' : theme.textSecondary}
          />
          <Text style={[styles.modeTabText, { color: activeMode === 'VOICE' ? '#ffffff' : theme.textSecondary }]}>
            {t('aiModeVoice')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ========================================================================= */}
      {/* 1. TEXT MODE VIEW */}
      {/* ========================================================================= */}
      {activeMode === 'TEXT' && (
        <View style={styles.textModeWrapper}>
          {/* Suggested Quick Chips */}
          <View style={styles.chipsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
              {DOMAIN_SUGGESTED_CHIPS.map((chip) => (
                <TouchableOpacity
                  key={chip.id}
                  style={[styles.chip, { backgroundColor: theme.card, borderColor: theme.border }]}
                  onPress={() => processQuery(chip.query, false)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, { color: theme.textPrimary }]}>
                    {t(chip.labelKey as any, chip.query)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Messages Scroll Area */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesScroll}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((msg, idx) => (
              <View
                key={msg.id || idx}
                style={[
                  styles.messageRow,
                  msg.sender === 'user' ? styles.messageRowUser : styles.messageRowAi,
                ]}
              >
                {msg.sender === 'ai' && (
                  <View style={[styles.aiAvatar, { backgroundColor: theme.primaryLight }]}>
                    <MaterialCommunityIcons name="robot-happy" size={16} color={theme.primary} />
                  </View>
                )}

                <View style={styles.bubbleWrapper}>
                  <View
                    style={[
                      styles.bubble,
                      msg.sender === 'user'
                        ? [styles.bubbleUser, { backgroundColor: theme.primary }]
                        : [styles.bubbleAi, { backgroundColor: theme.card, borderColor: theme.border }],
                      msg.scope === 'OUT_OF_SCOPE' && styles.bubbleOutOfScope,
                      msg.scope === 'SECURITY_RISK' && styles.bubbleSecurity,
                    ]}
                  >
                    {msg.scope === 'OUT_OF_SCOPE' && (
                      <View style={styles.scopeTag}>
                        <MaterialCommunityIcons name="shield-alert" size={12} color="#dc2626" />
                        <Text style={styles.scopeTagText}>SMART COLD STORAGE SCOPE GUARD</Text>
                      </View>
                    )}

                    {msg.scope === 'SECURITY_RISK' && (
                      <View style={styles.scopeTag}>
                        <MaterialCommunityIcons name="lock" size={12} color="#dc2626" />
                        <Text style={styles.scopeTagText}>SECURITY FIREWALL</Text>
                      </View>
                    )}

                    <Text
                      style={[
                        styles.bubbleText,
                        msg.sender === 'user'
                          ? styles.bubbleTextUser
                          : { color: theme.textPrimary },
                      ]}
                    >
                      {msg.text || (isStreaming && msg.sender === 'ai' ? '...' : '')}
                    </Text>

                    {/* Structured Telemetry Card */}
                    {msg.card && renderStructuredCard(msg.card)}

                    <View style={styles.metaRow}>
                      {msg.intent && msg.intent !== 'out_of_scope' && msg.intent !== 'prompt_injection' && (
                        <Text style={[styles.intentBadge, { color: theme.primary, backgroundColor: theme.primaryLight }]}>
                          #{msg.intent}
                        </Text>
                      )}
                      <Text style={[styles.timestamp, msg.sender === 'user' ? styles.timestampUser : { color: theme.textMuted }]}>
                        {msg.timestamp}
                      </Text>
                    </View>
                  </View>

                  {/* Actions for AI Responses: Speak & Regenerate */}
                  {msg.sender === 'ai' && !isStreaming && msg.text ? (
                    <View style={styles.msgActionRow}>
                      <TouchableOpacity
                        style={[styles.audioPillBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
                        onPress={() => {
                          VoiceService.unlockAudio();
                          if (VoiceService.getIsSpeaking()) {
                            VoiceService.stopSpeaking();
                          } else {
                            VoiceService.speak(msg.text, { language });
                          }
                        }}
                        activeOpacity={0.7}
                      >
                        <MaterialCommunityIcons name="volume-high" size={13} color={theme.primary} />
                        <Text style={[styles.audioPillText, { color: theme.primary }]}>
                          {language === 'hi' ? 'बोलकर सुनाएं' : 'Listen 🔊'}
                        </Text>
                      </TouchableOpacity>

                      {idx === messages.length - 1 && idx > 0 && (
                        <TouchableOpacity
                          style={styles.regenerateRow}
                          onPress={handleRegenerateLast}
                          activeOpacity={0.7}
                        >
                          <Feather name="refresh-cw" size={11} color={theme.textMuted} />
                          <Text style={[styles.regenerateText, { color: theme.textMuted }]}>{t('aiRegenerate')}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ) : null}
                </View>
              </View>
            ))}

            {isTyping && (
              <View style={styles.typingRow}>
                <ActivityIndicator size="small" color={theme.primary} />
                <Text style={[styles.typingText, { color: theme.textMuted }]}>{t('aiAnalyzing')}</Text>
              </View>
            )}
          </ScrollView>

          {/* Text Input Bar with Stop & Send Controls */}
          <View style={[styles.inputBar, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
            <TouchableOpacity
              style={[styles.quickVoiceBtn, { backgroundColor: theme.primaryLight }]}
              onPress={() => {
                setActiveMode('VOICE');
                setTimeout(() => handleStartVoiceListening(), 100);
              }}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="microphone-outline" size={20} color={theme.primary} />
            </TouchableOpacity>

            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundSubtle, color: theme.textPrimary, borderColor: theme.border }]}
              placeholder={t('aiPlaceholder')}
              placeholderTextColor={theme.textMuted}
              value={inputQuery}
              onChangeText={setInputQuery}
              onSubmitEditing={() => !isStreaming && processQuery(inputQuery, false)}
              editable={!isStreaming}
            />

            {isStreaming ? (
              <TouchableOpacity
                style={[styles.stopBtn, { backgroundColor: '#ef4444' }]}
                onPress={handleStopGenerating}
                activeOpacity={0.85}
              >
                <MaterialCommunityIcons name="stop" size={18} color="#ffffff" />
                <Text style={styles.stopBtnText}>{t('aiStopGenerating')}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.sendBtn,
                  { backgroundColor: theme.primary },
                  !inputQuery.trim() && styles.sendBtnDisabled,
                ]}
                onPress={() => processQuery(inputQuery, false)}
                disabled={!inputQuery.trim()}
                activeOpacity={0.85}
              >
                <Feather name="send" size={16} color="#ffffff" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* ========================================================================= */}
      {/* 2. VOICE MODE VIEW */}
      {/* ========================================================================= */}
      {activeMode === 'VOICE' && (
        <ScrollView
          style={styles.voiceModeContainer}
          contentContainerStyle={styles.voiceModeContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Animated Central Voice Orb */}
          <View style={styles.orbSection}>
            <View style={styles.orbOuterRing}>
              {(voiceState === 'LISTENING' || voiceState === 'SPEAKING') && (
                <Animated.View
                  style={[
                    styles.rippleCircle,
                    voiceState === 'LISTENING' ? styles.rippleListening : styles.rippleSpeaking,
                    { transform: [{ scale: pulseAnim }] },
                  ]}
                />
              )}

              <Animated.View
                style={[
                  styles.orbCenter,
                  voiceState === 'LISTENING'
                    ? styles.orbListening
                    : voiceState === 'PROCESSING'
                    ? styles.orbProcessing
                    : voiceState === 'SPEAKING'
                    ? styles.orbSpeaking
                    : styles.orbIdle,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                <LinearGradient
                  colors={
                    voiceState === 'LISTENING'
                      ? ['#16a34a', '#15803d']
                      : voiceState === 'PROCESSING'
                      ? ['#eab308', '#ca8a04']
                      : voiceState === 'SPEAKING'
                      ? ['#0284c7', '#0369a1']
                      : ['#334155', '#1e293b']
                  }
                  style={styles.orbGradient}
                >
                  <MaterialCommunityIcons
                    name={
                      voiceState === 'LISTENING'
                        ? 'microphone'
                        : voiceState === 'PROCESSING'
                        ? 'cog-sync'
                        : voiceState === 'SPEAKING'
                        ? 'volume-high'
                        : 'microphone-outline'
                    }
                    size={46}
                    color="#ffffff"
                  />
                </LinearGradient>
              </Animated.View>
            </View>

            {/* Voice Status Pill & Note */}
            <View style={styles.voiceStatusBlock}>
              <View
                style={[
                  styles.voiceStateBadge,
                  voiceState === 'LISTENING'
                    ? styles.stateBadgeListening
                    : voiceState === 'PROCESSING'
                    ? styles.stateBadgeProcessing
                    : voiceState === 'SPEAKING'
                    ? styles.stateBadgeSpeaking
                    : styles.stateBadgeIdle,
                ]}
              >
                <View
                  style={[
                    styles.voiceStateDot,
                    voiceState === 'LISTENING'
                      ? { backgroundColor: '#16a34a' }
                      : voiceState === 'PROCESSING'
                      ? { backgroundColor: '#eab308' }
                      : voiceState === 'SPEAKING'
                      ? { backgroundColor: '#0284c7' }
                      : { backgroundColor: '#64748b' },
                  ]}
                />
                <Text style={styles.voiceStateBadgeText}>
                  {voiceState === 'LISTENING'
                    ? 'LISTENING (सुन रहे हैं)'
                    : voiceState === 'PROCESSING'
                    ? 'ANALYZING (विश्लेषण)'
                    : voiceState === 'SPEAKING'
                    ? 'SPEAKING (बोल रहे हैं)'
                    : 'READY TO LISTEN'}
                </Text>
              </View>

              <Text style={[styles.voiceStatusNote, { color: theme.textSecondary }]}>{voiceStatusNote}</Text>
            </View>
          </View>

          {/* Spoken Transcription Bubble */}
          {voiceTranscript ? (
            <View style={[styles.transcriptBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.transcriptHeader}>
                <MaterialCommunityIcons name="account-voice" size={15} color={theme.primary} />
                <Text style={[styles.transcriptHeading, { color: theme.primary }]}>You Asked (आपने पूछा):</Text>
              </View>
              <Text style={[styles.transcriptText, { color: theme.textPrimary }]}>"{voiceTranscript}"</Text>
            </View>
          ) : null}

          {/* Latest AI Spoken Response Card */}
          {latestAiMessage && (
            <View style={[styles.voiceResponseCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.voiceResponseHeader}>
                <View style={[styles.aiBadge, { backgroundColor: theme.primaryLight }]}>
                  <MaterialCommunityIcons name="robot-happy" size={14} color={theme.primary} />
                  <Text style={[styles.aiBadgeText, { color: theme.primaryDark }]}>{t('aiTitle')}</Text>
                </View>

                {voiceState === 'SPEAKING' && (
                  <TouchableOpacity
                    style={styles.stopSpeakingBtn}
                    onPress={handleBargeInStopSpeaking}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons name="stop-circle" size={14} color="#ef4444" />
                    <Text style={styles.stopSpeakingBtnText}>Stop Speech</Text>
                  </TouchableOpacity>
                )}
              </View>

              <Text style={[styles.voiceResponseText, { color: theme.textPrimary }]}>{latestAiMessage.text}</Text>

              {latestAiMessage.card && renderStructuredCard(latestAiMessage.card)}
            </View>
          )}

          {/* Voice Action & Microphone Controls */}
          <View style={styles.voiceControlsContainer}>
            <View style={styles.controlsRow}>
              <TouchableOpacity
                style={[styles.secondaryControlBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={() => {
                  if (VoiceService.getIsSpeaking()) VoiceService.stopSpeaking();
                  setIsTTSMuted(!isTTSMuted);
                }}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name={isTTSMuted ? 'volume-off' : 'volume-high'}
                  size={20}
                  color={isTTSMuted ? '#ef4444' : theme.textPrimary}
                />
                <Text style={[styles.controlBtnLabel, { color: theme.textSecondary }]}>
                  {isTTSMuted ? 'Muted' : 'Sound On'}
                </Text>
              </TouchableOpacity>

              {/* Main Microphone Button */}
              <TouchableOpacity
                style={[styles.mainMicBtn, voiceState === 'LISTENING' && styles.mainMicBtnListening]}
                onPress={() => {
                  if (voiceState === 'LISTENING') {
                    handleStopVoiceListening();
                  } else {
                    handleStartVoiceListening();
                  }
                }}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={
                    voiceState === 'LISTENING' ? ['#ef4444', '#dc2626'] : ['#16a34a', '#15803d']
                  }
                  style={styles.mainMicGradient}
                >
                  <MaterialCommunityIcons
                    name={voiceState === 'LISTENING' ? 'stop' : 'microphone'}
                    size={32}
                    color="#ffffff"
                  />
                </LinearGradient>
              </TouchableOpacity>

              {/* Stop / Barge-in Button */}
              <TouchableOpacity
                style={[styles.secondaryControlBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={handleBargeInStopSpeaking}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="stop-circle-outline" size={20} color={theme.textPrimary} />
                <Text style={[styles.controlBtnLabel, { color: theme.textSecondary }]}>Barge-In</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.micInstruction, { color: theme.textMuted }]}>
              {voiceState === 'LISTENING'
                ? '🔴 Listening... Tap to finish'
                : '🎙️ Tap microphone to speak (Bilingual: English / Hindi / Hinglish)'}
            </Text>
          </View>

          {/* Quick Voice Prompt Chips */}
          <View style={styles.voicePresetsSection}>
            <Text style={[styles.voicePresetsHeading, { color: theme.textMuted }]}>
              BILINGUAL VOICE PROMPTS (बोलकर पूछें):
            </Text>
            <View style={styles.voicePresetsGrid}>
              {VOICE_PRESET_QUERIES.map((preset) => (
                <TouchableOpacity
                  key={preset.id}
                  style={[styles.presetChip, { backgroundColor: theme.card, borderColor: theme.border }]}
                  onPress={() => handleVoicePresetSelect(preset.text)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.presetChipTitle, { color: theme.primary }]}>{preset.label}</Text>
                  <Text style={[styles.presetChipQuery, { color: theme.textPrimary }]}>
                    "{language === 'hi' ? preset.textHi : preset.text}"
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      )}

      {/* Observability Trace Modal */}
      <AIObservabilityModal
        visible={isObservabilityOpen}
        onClose={() => setIsObservabilityOpen(false)}
        traces={executionLogs}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  traceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  traceBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  modeSwitchContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 14,
    padding: 3,
    borderWidth: 1,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 11,
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: '700',
  },
  textModeWrapper: {
    flex: 1,
  },
  chipsContainer: {
    paddingVertical: 6,
  },
  chipsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  messageRow: {
    flexDirection: 'row',
    gap: 8,
    maxWidth: '88%',
  },
  messageRowUser: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  messageRowAi: {
    alignSelf: 'flex-start',
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  bubbleWrapper: {
    flex: 1,
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleUser: {
    borderBottomRightRadius: 4,
  },
  bubbleAi: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  bubbleOutOfScope: {
    borderColor: '#fca5a5',
    backgroundColor: '#fff1f2',
  },
  bubbleSecurity: {
    borderColor: '#fca5a5',
    backgroundColor: '#fef2f2',
  },
  scopeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  scopeTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#dc2626',
    letterSpacing: 0.4,
  },
  bubbleText: {
    fontSize: 13.5,
    lineHeight: 20,
  },
  bubbleTextUser: {
    color: '#ffffff',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  intentBadge: {
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  timestamp: {
    fontSize: 10,
    marginLeft: 'auto',
  },
  timestampUser: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  msgActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 5,
    marginLeft: 4,
  },
  audioPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  audioPillText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  regenerateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  regenerateText: {
    fontSize: 10.5,
    fontWeight: '600',
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  typingText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  quickVoiceBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 14,
    fontSize: 13,
    borderWidth: 1,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
  stopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 19,
  },
  stopBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  // Structured Card Styles
  cardContainer: {
    marginTop: 10,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
    flex: 1,
  },
  cardBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  cardBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  badgeSuccess: {
    backgroundColor: '#dcfce7',
  },
  badgeSuccessText: {
    color: '#15803d',
    fontSize: 10,
    fontWeight: '800',
  },
  badgeWarning: {
    backgroundColor: '#fef3c7',
  },
  badgeWarningText: {
    color: '#b45309',
    fontSize: 10,
    fontWeight: '800',
  },
  badgeInfo: {
    backgroundColor: '#e0f2fe',
  },
  badgeInfoText: {
    color: '#0369a1',
    fontSize: 10,
    fontWeight: '800',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 6,
  },
  metricItem: {
    flexBasis: '48%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '800',
  },
  highlightBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 6,
  },
  highlightText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  ctaBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  ctaBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  // Voice Mode Styles
  voiceModeContainer: {
    flex: 1,
  },
  voiceModeContent: {
    padding: 16,
    alignItems: 'center',
    gap: 16,
  },
  orbSection: {
    alignItems: 'center',
    marginVertical: 16,
  },
  orbOuterRing: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  rippleCircle: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
  },
  rippleListening: {
    borderColor: 'rgba(22, 163, 74, 0.4)',
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
  },
  rippleSpeaking: {
    borderColor: 'rgba(2, 132, 199, 0.4)',
    backgroundColor: 'rgba(2, 132, 199, 0.1)',
  },
  orbCenter: {
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  orbListening: {
    shadowColor: '#16a34a',
  },
  orbProcessing: {
    shadowColor: '#eab308',
  },
  orbSpeaking: {
    shadowColor: '#0284c7',
  },
  orbIdle: {
    shadowColor: '#64748b',
  },
  orbGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceStatusBlock: {
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  voiceStateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  stateBadgeListening: {
    backgroundColor: '#dcfce7',
  },
  stateBadgeProcessing: {
    backgroundColor: '#fef3c7',
  },
  stateBadgeSpeaking: {
    backgroundColor: '#e0f2fe',
  },
  stateBadgeIdle: {
    backgroundColor: '#f1f5f9',
  },
  voiceStateDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  voiceStateBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1e293b',
  },
  voiceStatusNote: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  transcriptBox: {
    width: '100%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  transcriptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  transcriptHeading: {
    fontSize: 11,
    fontWeight: '700',
  },
  transcriptText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  voiceResponseCard: {
    width: '100%',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  voiceResponseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  aiBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  stopSpeakingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
  },
  stopSpeakingBtnText: {
    color: '#ef4444',
    fontSize: 11,
    fontWeight: '700',
  },
  voiceResponseText: {
    fontSize: 13.5,
    lineHeight: 20,
  },
  voiceControlsContainer: {
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  secondaryControlBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    gap: 2,
  },
  controlBtnActive: {
    borderColor: '#ef4444',
  },
  controlBtnLabel: {
    fontSize: 9,
    fontWeight: '700',
  },
  mainMicBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: 'hidden',
    elevation: 6,
  },
  mainMicBtnListening: {
    transform: [{ scale: 1.08 }],
  },
  mainMicGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  micInstruction: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  voicePresetsSection: {
    width: '100%',
    marginTop: 12,
    gap: 8,
  },
  voicePresetsHeading: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  voicePresetsGrid: {
    gap: 8,
  },
  presetChip: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  presetChipTitle: {
    fontSize: 11,
    fontWeight: '700',
  },
  presetChipQuery: {
    fontSize: 12,
    marginTop: 2,
  },
});
