import { LanguageCode } from './user';

export type QueryScope = 'IN_SCOPE' | 'OUT_OF_SCOPE' | 'SECURITY_RISK';

export type QueryIntent =
  | 'storage_status'
  | 'storage_availability'
  | 'storage_capacity'
  | 'storage_booking'
  | 'inventory'
  | 'crop_advice'
  | 'spoilage_risk'
  | 'temperature'
  | 'humidity'
  | 'battery'
  | 'solar'
  | 'weather'
  | 'energy_forecast'
  | 'energy_demand'
  | 'alerts'
  | 'account'
  | 'platform_help'
  | 'faq'
  | 'architecture'
  | 'prompt_injection'
  | 'out_of_scope';

export interface StructuredCardMetric {
  label: string;
  labelHi?: string;
  value: string;
  icon?: string;
  color?: string;
  badge?: string;
}

export interface StructuredCardCTA {
  label: string;
  labelHi?: string;
  action: 'NAVIGATE' | 'TRIGGER_DEMO' | 'OPEN_MODAL' | 'SYNC';
  targetScreen?: string;
  payload?: any;
}

export interface StructuredCardData {
  type: 'ENERGY_FORECAST' | 'STORAGE_CAPACITY' | 'BATTERY_STATUS' | 'SPOILAGE_ALERT' | 'STORAGE_HEALTH' | 'INVENTORY_SUMMARY';
  title: string;
  titleHi?: string;
  statusBadge?: {
    text: string;
    textHi?: string;
    variant: 'success' | 'warning' | 'danger' | 'info';
  };
  metrics: StructuredCardMetric[];
  highlightText?: string;
  highlightTextHi?: string;
  ctas?: StructuredCardCTA[];
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  detectedLanguage?: LanguageCode;
  intent?: QueryIntent;
  scope?: QueryScope;
  card?: StructuredCardData;
  executionTrace?: AIExecutionTrace;
}

export interface RAGKnowledgeChunk {
  id: string;
  title: string;
  titleHi?: string;
  category: 'architecture' | 'hardware' | 'crop_rules' | 'energy_ml' | 'capacity_math' | 'spoilage_model' | 'booking_workflow' | 'troubleshooting' | 'faq' | 'policy';
  feature?: string;
  crop?: string;
  contentEn: string;
  contentHi: string;
  contentHinglish: string;
  keywords: string[];
  role?: 'farmer' | 'operator' | 'admin';
}

export type AIMode = 'TEXT' | 'VOICE';

export type VoiceState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'SPEAKING' | 'ERROR';

export interface AIExecutionTrace {
  query: string;
  timestamp: string;
  detectedLanguage: LanguageCode;
  scope: QueryScope;
  intent: QueryIntent;
  securityFlag: boolean;
  retrievedChunks: string[];
  toolExecuted?: string;
  toolResultSummary?: string;
  latencyMs: number;
  isVoice?: boolean;
  sttLatencyMs?: number;
  ttsLatencyMs?: number;
  voiceTranscript?: string;
  spokenResponse?: string;
}
