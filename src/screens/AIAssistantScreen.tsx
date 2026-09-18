import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Image, Animated, Easing } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { AiService } from '../services/aiService';
import { VoiceService } from '../services/voiceService';
import { AIMessage, StructuredCardData, AIExecutionTrace, AIMode, VoiceState } from '../types/ai';
import { LanguageCode } from '../types/user';
import AIObservabilityModal from '../components/AIObservabilityModal';

const DOMAIN_SUGGESTED_CHIPS = [
  { id: 'storage-safe', label: '🛡 Is cold storage safe?', labelHi: '🛡 क्या स्टोरेज सुरक्षित है?', query: 'Cold storage safe hai kya?' },
  { id: 'capacity-rec', label: '📦 How much can I store?', labelHi: '📦 कल कितना माल रख सकते हैं?', query: 'Kal kitna maal rakh sakte hain?' },
  { id: 'solar-forecast', label: '☀️ Tomorrow’s solar forecast', labelHi: '☀️ कल कितनी बिजली बनेगी?', query: 'Kal kitni bijli banegi?' },
  { id: 'battery-check', label: '🔋 Check battery backup', labelHi: '🔋 बैटरी बैकअप कितना है?', query: 'Battery kitni hai?' },
  { id: 'inventory-show', label: '🥬 Show stored vegetables', labelHi: '🥬 मेरी भंडारित फसलें दिखाएं', query: 'Show my stored vegetables' },
  { id: 'spoilage-advice', label: '💰 Freshness & Selling advice', labelHi: '💰 टमाटर/फूलगोभी की ताजगी सलाह', query: 'Tomato kitne din tak fresh rahega?' },
  { id: 'how-works', label: '⚙️ How does system work?', labelHi: '⚙️ यह सिस्टम कैसे काम करता है?', query: 'How does your cold storage work?' },
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
  language = 'en',
  onNavigate,
}: AIAssistantScreenProps) {
  // Mode selection: TEXT vs VOICE
  const [activeMode, setActiveMode] = useState<AIMode>('TEXT');

  // Shared Conversation History
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: language === 'hi'
        ? 'नमस्ते किसान भाई! मैं आपका स्मार्ट कोल्ड स्टोरेज सहायक हूँ। अपने कोल्ड स्टोरेज, सौर/पवन ऊर्जा पूर्वानुमान, बैटरी बैकअप, या अनुशंसित भंडारण क्षमता के बारे में पूछें।'
        : language === 'hinglish'
        ? 'Namaste Kisan Bhai! Main aapka Smart Cold Storage AI Assistant hoon. Cold storage status, kal ki bijli forecast, battery backup ya kitna maal store karein ke baare me poochhein.'
        : 'Hello! I am your Smart Cold Storage AI Assistant. Ask me about real-time cold room status, solar/wind energy forecasting, battery backup, or recommended storage capacity.',
      timestamp: 'Just now',
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isObservabilityOpen, setIsObservabilityOpen] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<AIExecutionTrace[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  // Voice Mode State
  const [voiceState, setVoiceState] = useState<VoiceState>('IDLE');
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const [voiceStatusNote, setVoiceStatusNote] = useState<string>('Tap microphone to speak (बोलिए...)');
  const [isTTSMuted, setIsTTSMuted] = useState<boolean>(false);

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
      VoiceService.stopListening();
      VoiceService.stopSpeaking();
    };
  }, []);

  /**
   * Unified Query Processing Pipeline
   */
  const processQuery = async (
    queryText: string,
    isVoiceQuery: boolean = false,
    sttDurationMs?: number
  ) => {
    const textToSend = queryText.trim();
    if (!textToSend) return;

    const userMsg: AIMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);
    if (isVoiceQuery) {
      setVoiceState('PROCESSING');
      setVoiceStatusNote('Analyzing IoT telemetry & ML energy models...');
    }

    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    // Call Strictly Scoped AI Assistant Pipeline
    const response = await AiService.queryAssistant(
      textToSend,
      language,
      isVoiceQuery,
      { sttLatencyMs: sttDurationMs, voiceTranscript: textToSend }
    );

    setIsTyping(false);

    const aiMsg: AIMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'ai',
      text: response.text,
      card: response.card,
      detectedLanguage: response.trace.detectedLanguage,
      intent: response.trace.intent,
      scope: response.trace.scope,
      executionTrace: response.trace,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, aiMsg]);
    setExecutionLogs(AiService.getExecutionLogs());

    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 150);

    // If in Voice Mode and not muted, trigger TTS Speech vocalization
    if (isVoiceQuery || activeMode === 'VOICE') {
      if (!isTTSMuted && response.spokenText) {
        setVoiceState('SPEAKING');
        setVoiceStatusNote('Speaking response...');

        VoiceService.speak(response.spokenText, {
          language: response.trace.detectedLanguage,
          onStart: () => {
            setVoiceState('SPEAKING');
            setVoiceStatusNote('Speaking response...');
          },
          onEnd: () => {
            setVoiceState('IDLE');
            setVoiceStatusNote('Tap microphone to speak again');
          },
          onError: () => {
            setVoiceState('IDLE');
            setVoiceStatusNote('Tap microphone to speak again');
          },
        });
      } else {
        setVoiceState('IDLE');
        setVoiceStatusNote('Response ready. Tap microphone to speak');
      }
    }
  };

  /**
   * Voice Interaction Handlers
   */
  const handleStartVoiceListening = () => {
    // Barge-in: immediately stop assistant speech
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
        if (state === 'PROCESSING') setVoiceStatusNote('Processing voice input...');
        if (state === 'IDLE') setVoiceStatusNote('Tap microphone to speak');
      },
      onError: (errMsg) => {
        setVoiceState('IDLE');
        setVoiceStatusNote(errMsg);
      },
    });

    if (!success) {
      // Fallback simulation for devices/browsers without live mic permission
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
    VoiceService.stopSpeaking();
    setVoiceTranscript(presetQuery);
    processQuery(presetQuery, true, 50);
  };

  const renderStructuredCard = (card: StructuredCardData) => {
    return (
      <View style={styles.cardContainer}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{language === 'hi' && card.titleHi ? card.titleHi : card.title}</Text>
          {card.statusBadge && (
            <View style={[
              styles.cardBadge,
              card.statusBadge.variant === 'success' ? styles.badgeSuccess :
              card.statusBadge.variant === 'warning' ? styles.badgeWarning :
              styles.badgeInfo
            ]}>
              <Text style={[
                styles.cardBadgeText,
                card.statusBadge.variant === 'success' ? styles.badgeSuccessText :
                card.statusBadge.variant === 'warning' ? styles.badgeWarningText :
                styles.badgeInfoText
              ]}>
                {language === 'hi' && card.statusBadge.textHi ? card.statusBadge.textHi : card.statusBadge.text}
              </Text>
            </View>
          )}
        </View>

        {/* Card Metrics Grid */}
        <View style={styles.metricsGrid}>
          {card.metrics.map((m, idx) => (
            <View key={idx} style={styles.metricItem}>
              {m.icon && (
                <MaterialCommunityIcons name={m.icon as any} size={16} color={m.color || colors.primary} />
              )}
              <View>
                <Text style={styles.metricLabel}>{language === 'hi' && m.labelHi ? m.labelHi : m.label}</Text>
                <Text style={[styles.metricValue, { color: m.color || colors.textPrimary }]}>{m.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Card Highlight Note */}
        {card.highlightText && (
          <View style={styles.highlightBox}>
            <MaterialCommunityIcons name="information" size={14} color={colors.secondary} />
            <Text style={styles.highlightText}>
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
                style={styles.ctaBtn}
                onPress={() => {
                  if (cta.action === 'NAVIGATE' && cta.targetScreen && onNavigate) {
                    onNavigate(cta.targetScreen);
                  }
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.ctaBtnText}>{language === 'hi' && cta.labelHi ? cta.labelHi : cta.label} →</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  const latestAiMessage = messages.filter(m => m.sender === 'ai').slice(-1)[0];

  return (
    <View style={styles.container}>
      {/* Header Banner with Live Connected Status & Observability Trace Trigger */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.headerAvatar}
            resizeMode="cover"
          />
          <View>
            <Text style={styles.title}>Smart Storage Assistant</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Connected to Smart Storage (SC-001)</Text>
            </View>
          </View>
        </View>

        {/* SIH Judge / Admin Observability Trigger */}
        <TouchableOpacity
          style={styles.traceBtn}
          onPress={() => setIsObservabilityOpen(true)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="radar" size={15} color={colors.primary} />
          <Text style={styles.traceBtnText}>AI Trace</Text>
        </TouchableOpacity>
      </View>

      {/* Mode Switcher Segment: [ 💬 Text Mode ] vs [ 🎙️ Voice Mode ] */}
      <View style={styles.modeSwitchContainer}>
        <TouchableOpacity
          style={[styles.modeTab, activeMode === 'TEXT' && styles.modeTabActive]}
          onPress={() => {
            VoiceService.stopSpeaking();
            VoiceService.stopListening();
            setVoiceState('IDLE');
            setActiveMode('TEXT');
          }}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons
            name="message-text"
            size={16}
            color={activeMode === 'TEXT' ? '#ffffff' : colors.textSecondary}
          />
          <Text style={[styles.modeTabText, activeMode === 'TEXT' && styles.modeTabTextActive]}>
            Text Mode (टेक्स्ट)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeTab, activeMode === 'VOICE' && styles.modeTabActiveVoice]}
          onPress={() => {
            setActiveMode('VOICE');
          }}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons
            name="microphone"
            size={16}
            color={activeMode === 'VOICE' ? '#ffffff' : colors.textSecondary}
          />
          <Text style={[styles.modeTabText, activeMode === 'VOICE' && styles.modeTabTextActive]}>
            Voice Mode (आवाज़)
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
                  style={styles.chip}
                  onPress={() => processQuery(chip.query, false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.chipText}>{language === 'hi' ? chip.labelHi : chip.label}</Text>
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
            {messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.messageRow,
                  msg.sender === 'user' ? styles.messageRowUser : styles.messageRowAi,
                ]}
              >
                {msg.sender === 'ai' && (
                  <View style={styles.aiAvatar}>
                    <MaterialCommunityIcons name="robot-happy" size={16} color={colors.primary} />
                  </View>
                )}

                <View style={styles.bubbleWrapper}>
                  <View
                    style={[
                      styles.bubble,
                      msg.sender === 'user' ? styles.bubbleUser : styles.bubbleAi,
                      msg.scope === 'OUT_OF_SCOPE' && styles.bubbleOutOfScope,
                      msg.scope === 'SECURITY_RISK' && styles.bubbleSecurity,
                    ]}
                  >
                    {msg.scope === 'OUT_OF_SCOPE' && (
                      <View style={styles.scopeTag}>
                        <MaterialCommunityIcons name="shield-alert" size={12} color="#dc2626" />
                        <Text style={styles.scopeTagText}>DOMAIN SCOPE NOTICE</Text>
                      </View>
                    )}

                    {msg.scope === 'SECURITY_RISK' && (
                      <View style={styles.scopeTag}>
                        <MaterialCommunityIcons name="lock" size={12} color="#dc2626" />
                        <Text style={styles.scopeTagText}>SECURITY FIREWALL</Text>
                      </View>
                    )}

                    <Text style={[styles.bubbleText, msg.sender === 'user' && styles.bubbleTextUser]}>
                      {msg.text}
                    </Text>

                    {/* Structured Telemetry Card Component */}
                    {msg.card && renderStructuredCard(msg.card)}

                    <View style={styles.metaRow}>
                      {msg.intent && msg.intent !== 'out_of_scope' && msg.intent !== 'prompt_injection' && (
                        <Text style={styles.intentBadge}>#{msg.intent}</Text>
                      )}
                      <Text style={[styles.timestamp, msg.sender === 'user' && styles.timestampUser]}>
                        {msg.timestamp}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}

            {isTyping && (
              <View style={styles.typingRow}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.typingText}>Analyzing IoT telemetry & ML energy models...</Text>
              </View>
            )}
          </ScrollView>

          {/* Text Input Bar with Quick Voice Trigger */}
          <View style={styles.inputBar}>
            <TouchableOpacity
              style={styles.quickVoiceBtn}
              onPress={() => {
                setActiveMode('VOICE');
                setTimeout(() => handleStartVoiceListening(), 100);
              }}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="microphone-outline" size={20} color={colors.primary} />
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder={language === 'hi' ? 'स्टोरेज, बिजली या फसलों के बारे में पूछें...' : 'Ask about storage, solar forecast, battery...'}
              placeholderTextColor={colors.textMuted}
              value={inputQuery}
              onChangeText={setInputQuery}
              onSubmitEditing={() => processQuery(inputQuery, false)}
            />

            <TouchableOpacity
              style={[styles.sendBtn, !inputQuery.trim() && styles.sendBtnDisabled]}
              onPress={() => processQuery(inputQuery, false)}
              disabled={!inputQuery.trim()}
              activeOpacity={0.85}
            >
              <Feather name="send" size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ========================================================================= */}
      {/* 2. VOICE MODE VIEW */}
      {/* ========================================================================= */}
      {activeMode === 'VOICE' && (
        <ScrollView style={styles.voiceModeContainer} contentContainerStyle={styles.voiceModeContent} showsVerticalScrollIndicator={false}>
          {/* Animated Central Voice Orb */}
          <View style={styles.orbSection}>
            <View style={styles.orbOuterRing}>
              {/* Pulsing visualizer circles */}
              {(voiceState === 'LISTENING' || voiceState === 'SPEAKING') && (
                <Animated.View
                  style={[
                    styles.rippleCircle,
                    voiceState === 'LISTENING' ? styles.rippleListening : styles.rippleSpeaking,
                    {
                      transform: [{ scale: pulseAnim }],
                    },
                  ]}
                />
              )}

              <Animated.View
                style={[
                  styles.orbCenter,
                  voiceState === 'LISTENING' ? styles.orbListening :
                  voiceState === 'PROCESSING' ? styles.orbProcessing :
                  voiceState === 'SPEAKING' ? styles.orbSpeaking :
                  styles.orbIdle,
                  {
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              >
                <LinearGradient
                  colors={
                    voiceState === 'LISTENING' ? ['#16a34a', '#15803d'] :
                    voiceState === 'PROCESSING' ? ['#eab308', '#ca8a04'] :
                    voiceState === 'SPEAKING' ? ['#0284c7', '#0369a1'] :
                    ['#334155', '#1e293b']
                  }
                  style={styles.orbGradient}
                >
                  <MaterialCommunityIcons
                    name={
                      voiceState === 'LISTENING' ? 'microphone' :
                      voiceState === 'PROCESSING' ? 'cog-sync' :
                      voiceState === 'SPEAKING' ? 'volume-high' :
                      'microphone-outline'
                    }
                    size={46}
                    color="#ffffff"
                  />
                </LinearGradient>
              </Animated.View>
            </View>

            {/* Voice Status Pill & Note */}
            <View style={styles.voiceStatusBlock}>
              <View style={[
                styles.voiceStateBadge,
                voiceState === 'LISTENING' ? styles.stateBadgeListening :
                voiceState === 'PROCESSING' ? styles.stateBadgeProcessing :
                voiceState === 'SPEAKING' ? styles.stateBadgeSpeaking :
                styles.stateBadgeIdle
              ]}>
                <View style={[
                  styles.voiceStateDot,
                  voiceState === 'LISTENING' ? { backgroundColor: '#16a34a' } :
                  voiceState === 'PROCESSING' ? { backgroundColor: '#eab308' } :
                  voiceState === 'SPEAKING' ? { backgroundColor: '#0284c7' } :
                  { backgroundColor: '#64748b' }
                ]} />
                <Text style={styles.voiceStateBadgeText}>
                  {voiceState === 'LISTENING' ? 'LISTENING (सुन रहे हैं)' :
                   voiceState === 'PROCESSING' ? 'ANALYZING (विश्लेषण)' :
                   voiceState === 'SPEAKING' ? 'SPEAKING (बोल रहे हैं)' :
                   'READY TO LISTEN'}
                </Text>
              </View>

              <Text style={styles.voiceStatusNote}>{voiceStatusNote}</Text>
            </View>
          </View>

          {/* Spoken Transcription Bubble (What user said) */}
          {voiceTranscript ? (
            <View style={styles.transcriptBox}>
              <View style={styles.transcriptHeader}>
                <MaterialCommunityIcons name="account-voice" size={15} color={colors.primary} />
                <Text style={styles.transcriptHeading}>You Asked (आपने पूछा):</Text>
              </View>
              <Text style={styles.transcriptText}>"{voiceTranscript}"</Text>
            </View>
          ) : null}

          {/* Latest AI Spoken Response Card */}
          {latestAiMessage && (
            <View style={styles.voiceResponseCard}>
              <View style={styles.voiceResponseHeader}>
                <View style={styles.aiBadge}>
                  <MaterialCommunityIcons name="robot-happy" size={14} color={colors.primary} />
                  <Text style={styles.aiBadgeText}>Smart Storage AI</Text>
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

              <Text style={styles.voiceResponseText}>{latestAiMessage.text}</Text>

              {/* Display structured card in voice mode */}
              {latestAiMessage.card && renderStructuredCard(latestAiMessage.card)}
            </View>
          )}

          {/* Voice Action & Microphone Controls */}
          <View style={styles.voiceControlsContainer}>
            <View style={styles.controlsRow}>
              {/* Mute / Unmute TTS Toggle */}
              <TouchableOpacity
                style={[styles.secondaryControlBtn, isTTSMuted && styles.controlBtnActive]}
                onPress={() => {
                  if (VoiceService.getIsSpeaking()) VoiceService.stopSpeaking();
                  setIsTTSMuted(!isTTSMuted);
                }}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name={isTTSMuted ? "volume-off" : "volume-high"}
                  size={20}
                  color={isTTSMuted ? '#ef4444' : colors.textPrimary}
                />
                <Text style={styles.controlBtnLabel}>{isTTSMuted ? 'Muted' : 'Sound On'}</Text>
              </TouchableOpacity>

              {/* Main Microphone Button */}
              <TouchableOpacity
                style={[
                  styles.mainMicBtn,
                  voiceState === 'LISTENING' && styles.mainMicBtnListening
                ]}
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
                    voiceState === 'LISTENING' ? ['#ef4444', '#dc2626'] :
                    ['#16a34a', '#15803d']
                  }
                  style={styles.mainMicGradient}
                >
                  <MaterialCommunityIcons
                    name={voiceState === 'LISTENING' ? "stop" : "microphone"}
                    size={32}
                    color="#ffffff"
                  />
                </LinearGradient>
              </TouchableOpacity>

              {/* Stop / Barge-in Button */}
              <TouchableOpacity
                style={styles.secondaryControlBtn}
                onPress={handleBargeInStopSpeaking}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="stop-circle-outline" size={20} color={colors.textPrimary} />
                <Text style={styles.controlBtnLabel}>Barge-In</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.micInstruction}>
              {voiceState === 'LISTENING' ? '🔴 Listening... Tap to finish' : '🎙️ Tap microphone to speak (Bilingual: English / Hindi / Hinglish)'}
            </Text>
          </View>

          {/* Quick Voice Prompt Chips */}
          <View style={styles.voicePresetsSection}>
            <Text style={styles.voicePresetsHeading}>BILINGUAL VOICE PROMPTS (बोलकर पूछें):</Text>
            <View style={styles.voicePresetsGrid}>
              {VOICE_PRESET_QUERIES.map((preset) => (
                <TouchableOpacity
                  key={preset.id}
                  style={styles.presetChip}
                  onPress={() => handleVoicePresetSelect(preset.text)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.presetChipTitle}>{preset.label}</Text>
                  <Text style={styles.presetChipQuery}>"{language === 'hi' ? preset.textHi : preset.text}"</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      )}

      {/* SIH Judge / Admin Observability Modal */}
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
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
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
    backgroundColor: '#16a34a',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#16a34a',
  },
  traceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.25)',
  },
  traceBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
  },
  modeSwitchContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 10,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.backgroundSubtle,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modeTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  modeTabActiveVoice: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  modeTabTextActive: {
    color: '#ffffff',
  },
  textModeWrapper: {
    flex: 1,
  },
  chipsContainer: {
    backgroundColor: colors.card,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  chipsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    backgroundColor: colors.backgroundSubtle,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
    gap: 14,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowAi: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  bubbleWrapper: {
    maxWidth: '85%',
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleAi: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: colors.primary,
    borderTopRightRadius: 4,
  },
  bubbleOutOfScope: {
    backgroundColor: '#fff1f2',
    borderColor: '#fecdd3',
  },
  bubbleSecurity: {
    backgroundColor: '#fef2f2',
    borderColor: '#fee2e2',
  },
  scopeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#fecdd3',
  },
  scopeTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#dc2626',
    letterSpacing: 0.4,
  },
  bubbleText: {
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  bubbleTextUser: {
    color: '#ffffff',
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  intentBadge: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.primary,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  timestamp: {
    fontSize: 9,
    color: colors.textMuted,
  },
  timestampUser: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  cardContainer: {
    marginTop: 10,
    backgroundColor: colors.backgroundSubtle,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  cardBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cardBadgeText: {
    fontSize: 8,
    fontWeight: '800',
  },
  badgeSuccess: {
    backgroundColor: 'rgba(22, 163, 74, 0.15)',
  },
  badgeSuccessText: {
    color: '#16a34a',
    fontSize: 8,
    fontWeight: '800',
  },
  badgeWarning: {
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
  },
  badgeWarningText: {
    color: '#ca8a04',
    fontSize: 8,
    fontWeight: '800',
  },
  badgeInfo: {
    backgroundColor: 'rgba(2, 132, 199, 0.15)',
  },
  badgeInfoText: {
    color: '#0284c7',
    fontSize: 8,
    fontWeight: '800',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '48%',
    backgroundColor: colors.card,
    padding: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricLabel: {
    fontSize: 9,
    color: colors.textMuted,
  },
  metricValue: {
    fontSize: 11,
    fontWeight: '800',
  },
  highlightBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(2, 132, 199, 0.08)',
    padding: 6,
    borderRadius: 6,
  },
  highlightText: {
    fontSize: 10,
    color: '#0284c7',
    fontWeight: '600',
    flex: 1,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 2,
  },
  ctaBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  ctaBtnText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
  },
  typingText: {
    fontSize: 11,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 8,
  },
  quickVoiceBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: colors.backgroundSubtle,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontSize: 13,
    color: colors.textPrimary,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },

  /* ================= Voice Mode Styles ================= */
  voiceModeContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  voiceModeContent: {
    padding: 16,
    paddingBottom: 30,
    gap: 18,
    alignItems: 'center',
  },
  orbSection: {
    alignItems: 'center',
    paddingVertical: 12,
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
    backgroundColor: 'rgba(22, 163, 74, 0.08)',
  },
  rippleSpeaking: {
    borderColor: 'rgba(2, 132, 199, 0.4)',
    backgroundColor: 'rgba(2, 132, 199, 0.08)',
  },
  orbCenter: {
    width: 96,
    height: 96,
    borderRadius: 48,
    elevation: 8,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    overflow: 'hidden',
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
    shadowColor: '#000000',
  },
  orbGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceStatusBlock: {
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  voiceStateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stateBadgeListening: {
    backgroundColor: 'rgba(22, 163, 74, 0.15)',
  },
  stateBadgeProcessing: {
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
  },
  stateBadgeSpeaking: {
    backgroundColor: 'rgba(2, 132, 199, 0.15)',
  },
  stateBadgeIdle: {
    backgroundColor: colors.backgroundSubtle,
  },
  voiceStateDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  voiceStateBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  voiceStatusNote: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  transcriptBox: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  transcriptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  transcriptHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
  },
  transcriptText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    fontStyle: 'italic',
  },
  voiceResponseCard: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  voiceResponseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  stopSpeakingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stopSpeakingBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ef4444',
  },
  voiceResponseText: {
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 19,
  },
  voiceControlsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  mainMicBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    overflow: 'hidden',
  },
  mainMicBtnListening: {
    shadowColor: '#ef4444',
  },
  mainMicGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryControlBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  controlBtnActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  controlBtnLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: colors.textMuted,
  },
  micInstruction: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  voicePresetsSection: {
    width: '100%',
    gap: 8,
    marginTop: 4,
  },
  voicePresetsHeading: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  voicePresetsGrid: {
    gap: 8,
  },
  presetChip: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 2,
  },
  presetChipTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.secondary,
  },
  presetChipQuery: {
    fontSize: 12,
    color: colors.textPrimary,
  },
});
