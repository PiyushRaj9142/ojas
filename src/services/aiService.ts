import { LanguageCode } from '../types/user';
import { AIMessage, AIExecutionTrace, StructuredCardData } from '../types/ai';
import { ScopeClassifier } from './scopeClassifier';
import { AiPlatformTools } from './aiTools';
import { RAG_KNOWLEDGE_BASE } from '../data/ragKnowledgeBase';
import { VoiceService } from './voiceService';

export class AiService {
  private static executionLogs: AIExecutionTrace[] = [];

  static getExecutionLogs(): AIExecutionTrace[] {
    return [...this.executionLogs];
  }

  static getLatestTrace(): AIExecutionTrace | undefined {
    return this.executionLogs[this.executionLogs.length - 1];
  }

  /**
   * Main AI query processor combining Scope Check, RAG retrieval, Live Tools, and NL Generation
   */
  static async queryAssistant(
    userQuery: string,
    forcedLanguage?: LanguageCode,
    isVoice: boolean = false,
    voiceMetrics?: { sttLatencyMs?: number; voiceTranscript?: string }
  ): Promise<{ text: string; card?: StructuredCardData; spokenText?: string; trace: AIExecutionTrace }> {
    const startTime = Date.now();

    // 1. Scope & Intent Classification
    const classification = ScopeClassifier.classify(userQuery);
    const lang = forcedLanguage && forcedLanguage !== 'en' ? forcedLanguage : classification.detectedLanguage;

    // 2. Security / Prompt Injection Defense
    if (classification.scope === 'SECURITY_RISK') {
      const refusalText = lang === 'hi'
        ? 'मैं केवल अधिकृत स्मार्ट कोल्ड स्टोरेज प्लेटफॉर्म कार्यों में सहायता कर सकता हूँ।'
        : lang === 'hinglish'
        ? 'Main sirf authorized Smart Cold Storage platform tasks me madad kar sakta hoon.'
        : 'I can only assist with authorized Smart Cold Storage platform tasks.';

      const spokenText = VoiceService.formatForSpeech(refusalText, lang);

      const trace: AIExecutionTrace = {
        query: userQuery,
        timestamp: new Date().toLocaleTimeString(),
        detectedLanguage: lang,
        scope: 'SECURITY_RISK',
        intent: 'prompt_injection',
        securityFlag: true,
        retrievedChunks: [],
        latencyMs: Date.now() - startTime,
        isVoice,
        sttLatencyMs: voiceMetrics?.sttLatencyMs,
        voiceTranscript: voiceMetrics?.voiceTranscript,
        spokenResponse: spokenText,
      };
      this.executionLogs.push(trace);
      return { text: refusalText, spokenText, trace };
    }

    // 3. Strict Out-of-Scope Immediate Refusal
    if (classification.scope === 'OUT_OF_SCOPE') {
      const outOfScopeText = lang === 'hi'
        ? 'मैं आपका स्मार्ट कोल्ड स्टोरेज सहायक हूँ। मैं केवल इस प्लेटफॉर्म की सेवाओं जैसे कोल्ड स्टोरेज, फसल इन्वेंट्री, तापमान, आर्द्रता, सौर व पवन ऊर्जा उत्पादन, बैटरी स्थिति, ऊर्जा पूर्वानुमान, अनुशंसित भंडारण क्षमता और समर्थित बुकिंग में ही सहायता कर सकता हूँ।'
        : lang === 'hinglish'
        ? 'Main Smart Cold Storage Assistant hoon. Main sirf is platform ki services jaise cold storage, crop inventory, temperature, humidity, solar generation, battery status, energy prediction, storage recommendations aur supported bookings me help kar sakta hoon.'
        : 'I’m the Smart Cold Storage Assistant. I can only help with this platform’s services and project-related tasks, such as storage, crop inventory, temperature, humidity, solar generation, battery status, energy prediction, storage recommendations and supported bookings.';

      const spokenText = VoiceService.formatForSpeech(outOfScopeText, lang);

      const trace: AIExecutionTrace = {
        query: userQuery,
        timestamp: new Date().toLocaleTimeString(),
        detectedLanguage: lang,
        scope: 'OUT_OF_SCOPE',
        intent: 'out_of_scope',
        securityFlag: false,
        retrievedChunks: [],
        latencyMs: Date.now() - startTime,
        isVoice,
        sttLatencyMs: voiceMetrics?.sttLatencyMs,
        voiceTranscript: voiceMetrics?.voiceTranscript,
        spokenResponse: spokenText,
      };
      this.executionLogs.push(trace);
      return { text: outOfScopeText, spokenText, trace };
    }

    // 4. In-Scope Dynamic Tool Execution & Grounded Generation
    let replyText = '';
    let card: StructuredCardData | undefined = undefined;
    let toolName: string | undefined = undefined;
    let toolSummary: string | undefined = undefined;
    const retrievedChunkIds: string[] = [];

    switch (classification.intent) {
      // --- INTENT: Storage Capacity Calculation ---
      case 'storage_capacity': {
        toolName = 'calculate_storage_capacity()';
        const cap = await AiPlatformTools.calculate_storage_capacity();
        toolSummary = `Total: ${cap.totalCapacityKg}kg, Used: ${cap.currentLoadKg}kg, Available: ${cap.physicalAvailableKg}kg, Recommended: ${cap.energySafeRecommendedKg}kg`;

        if (lang === 'hi') {
          replyText = `वर्तमान ऊर्जा उपलब्धता और शीतलन स्थिति के आधार पर लगभग ${cap.energySafeRecommendedKg} kg अतिरिक्त उपज लोड करना अनुशंसित है। कुल 500 kg क्षमता में से ${cap.physicalAvailableKg} kg भौतिक स्थान शेष है।`;
        } else if (lang === 'hinglish') {
          replyText = `Current conditions aur predicted clean energy ke according lagbhag ${cap.energySafeRecommendedKg} kg additional produce store karna recommended hai. Total 500 kg me se abhi ${cap.physicalAvailableKg} kg space available hai.`;
        } else {
          replyText = `Based on current renewable energy availability and battery state, storing approximately ${cap.energySafeRecommendedKg} kg of additional produce is recommended. Out of 500 kg total capacity, ${cap.physicalAvailableKg} kg physical space is currently available.`;
        }

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
        break;
      }

      // --- INTENT: ML Energy & Solar Forecast ---
      case 'energy_forecast': {
        toolName = 'predict_energy_forecast()';
        const fc = await AiPlatformTools.predict_energy_forecast();
        toolSummary = `Tomorrow Generation: ${fc.tomorrowGenerationKwh} kWh, Demand: ${fc.tomorrowDemandKwh} kWh, Surplus: +${fc.surplusKwh} kWh`;

        if (lang === 'hi') {
          replyText = `कल के लिए अनुमानित सौर व पवन ऊर्जा उत्पादन ${fc.tomorrowGenerationKwh} kWh है। अनुमानित शीतलन मांग ${fc.tomorrowDemandKwh} kWh रहेगी, जिससे +${fc.surplusKwh} kWh शुद्ध ऊर्जा सरप्लस प्राप्त होगा।`;
        } else if (lang === 'hinglish') {
          replyText = `Kal ke liye estimated renewable generation ${fc.tomorrowGenerationKwh} kWh hai. Expected cooling load ${fc.tomorrowDemandKwh} kWh rahega, jisse +${fc.surplusKwh} kWh ka solid surplus generate hoga.`;
        } else {
          replyText = `Tomorrow's predicted renewable energy generation is ${fc.tomorrowGenerationKwh} kWh. Expected cold-storage cooling demand is ${fc.tomorrowDemandKwh} kWh, leaving a healthy net surplus of +${fc.surplusKwh} kWh.`;
        }

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
        break;
      }

      // --- INTENT: Battery Status & Optimization ---
      case 'battery': {
        toolName = 'get_battery_status()';
        const batt = await AiPlatformTools.get_battery_status();
        toolSummary = `SOC: ${batt.batteryLevelPercentage}%, Voltage: ${batt.batteryVoltage}V, Backup: ${batt.autonomousBackupHours}`;

        if (lang === 'hi') {
          replyText = `बैटरी वर्तमान में ${batt.batteryLevelPercentage}% (48.4V) चार्ज है। प्रणाली में ${batt.autonomousBackupHours} का स्वायत्त ऑफ-ग्रिड बैकअप उपलब्ध है। बैटरी का स्वास्थ्य उत्तम है।`;
        } else if (lang === 'hinglish') {
          replyText = `Battery abhi ${batt.batteryLevelPercentage}% (48.4V) par charged hai aur ${batt.autonomousBackupHours} ka solid backup hai. VAWT turbine se continuously charge ho rahi hai.`;
        } else {
          replyText = `Battery state of charge is ${batt.batteryLevelPercentage}% (${batt.batteryVoltage}V). The LiFePO4 battery pack has ${batt.autonomousBackupHours} of autonomous off-grid cooling reserve.`;
        }

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
          highlightTextHi: 'बैटरी 82% पर सुरक्षित है और पवन ऊर्जा से चार्ज हो रही है।',
          ctas: [
            { label: 'View Battery Telemetry', labelHi: 'बैटरी विवरण देखें', action: 'NAVIGATE', targetScreen: 'ENERGY' },
          ],
        };
        break;
      }

      // --- INTENT: Solar & Clean Energy Generation ---
      case 'solar': {
        toolName = 'get_solar_and_wind_generation()';
        const pwr = await AiPlatformTools.get_solar_and_wind_generation();
        toolSummary = `Power: ${pwr.currentRenewablePowerKw} kW, Daily: ${pwr.dailyYieldKwh} kWh, Surplus: +${pwr.netSurplusKw} kW`;

        if (lang === 'hi') {
          replyText = `आज कुल ${pwr.dailyYieldKwh} kWh स्वच्छ नवीकरणीय ऊर्जा उत्पन्न हुई है। वर्तमान उत्पादन दर ${pwr.currentRenewablePowerKw} kW है जबकि शीतलन में ${pwr.currentConsumptionKw} kW लग रहा है। ग्रिड निर्भरता 0% है।`;
        } else if (lang === 'hinglish') {
          replyText = `Aaj total ${pwr.dailyYieldKwh} kWh green energy bani hai. Current generation ${pwr.currentRenewablePowerKw} kW hai aur net surplus +${pwr.netSurplusKw} kW chal raha hai.`;
        } else {
          replyText = `Today's clean energy generation is ${pwr.dailyYieldKwh} kWh. Current generation rate is ${pwr.currentRenewablePowerKw} kW against ${pwr.currentConsumptionKw} kW consumption (+${pwr.netSurplusKw} kW surplus). Grid dependency is 0%.`;
        }
        break;
      }

      // --- INTENT: Storage Status & Safety ---
      case 'storage_status': {
        toolName = 'get_current_storage_status()';
        const st = await AiPlatformTools.get_current_storage_status();
        toolSummary = `Temp: ${st.temperature}°C, RH: ${st.humidity}%, Health: ${st.healthPercentage}%, Status: ${st.safetyStatus}`;

        if (lang === 'hi') {
          replyText = `कोल्ड स्टोरेज पूरी तरह सुरक्षित (SAFE) है। मुख्य तापमान ${st.temperature}°C और आर्द्रता ${st.humidity}% सामान्य रेंज में है। बैटरी ${st.batteryPercentage}% पर सुरक्षित है और समग्र स्वास्थ्य ${st.healthPercentage}% है।`;
        } else if (lang === 'hinglish') {
          replyText = `Cold storage bilkul SAFE hai (Health ${st.healthPercentage}%). Core temperature ${st.temperature}°C, humidity ${st.humidity}% aur battery ${st.batteryPercentage}% optimal range me hain.`;
        } else {
          replyText = `Your Smart Cold Storage is SAFE (Health ${st.healthPercentage}%). Core temperature is ${st.temperature}°C, relative humidity is ${st.humidity}%, and battery reserve is ${st.batteryPercentage}%.`;
        }

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
            { label: 'View Digital Twin', labelHi: 'डिजिटल ट्विन देखें', action: 'NAVIGATE', targetScreen: 'DIGITAL_TWIN' },
          ],
        };
        break;
      }

      // --- INTENT: Spoilage Risk & Crop Freshness ---
      case 'spoilage_risk': {
        toolName = 'get_spoilage_risk()';
        const sp = await AiPlatformTools.get_spoilage_risk();
        toolSummary = `Overall Risk: ${sp.overallRiskPercentage}%, High Risk Count: ${sp.highRiskCrops.length}`;

        if (lang === 'hi') {
          replyText = `कोल्ड स्टोरेज में कुल सड़न जोखिम केवल ${sp.overallRiskPercentage}% (निम्न) है। फूलगोभी (25 kg) की शेल्फ लाइफ 6 दिन बची है और 3 दिनों में मंडी निकासी की सलाह है। टमाटर (120 kg) 92% ताजगी के साथ 8 दिनों तक सुरक्षित हैं।`;
        } else if (lang === 'hinglish') {
          replyText = `Overall chamber spoilage risk sirf ${sp.overallRiskPercentage}% (Low) hai. Cauliflower (25 kg) ki freshness 76% hai jise 3 din me sell karna best rahega. Tomatoes (120 kg) 92% fresh hain.`;
        } else {
          replyText = `Overall chamber spoilage risk is low at ${sp.overallRiskPercentage}%. Cauliflower (25 kg) has 6 days remaining and is showing slight moisture loss—recommend dispatch within 3 days. Tomatoes (120 kg) are at 92% freshness with 8 days shelf life.`;
        }

        card = {
          type: 'SPOILAGE_ALERT',
          title: 'AI Freshness & Spoilage Advisory',
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
        break;
      }

      // --- INTENT: Temperature ---
      case 'temperature': {
        toolName = 'get_temperature()';
        const t = await AiPlatformTools.get_temperature();
        toolSummary = `Core: ${t.coreTemp}°C, Zone A: 5.2°C, Zone B: 4.7°C, Zone C: 2.8°C`;

        if (lang === 'hi') {
          replyText = `मुख्य तापमान ${t.coreTemp}°C (अनुकूलतम) है। ज़ोन A (टमाटर): 5.2°C, ज़ोन B (गाजर): 4.7°C, और ज़ोन C (पत्तेदार सब्जियां): 2.8°C पर सुचारू रूप से कार्य कर रहे हैं।`;
        } else if (lang === 'hinglish') {
          replyText = `Cold storage ka core temperature abhi ${t.coreTemp}°C hai. Zone A me 5.2°C, Zone B me 4.7°C aur Zone C me 2.8°C optimal cooling maintain ho rahi hai.`;
        } else {
          replyText = `The core cold chamber temperature is ${t.coreTemp}°C (Optimal). Zone A is at 5.2°C, Zone B is at 4.7°C, and Zone C is at 2.8°C.`;
        }
        break;
      }

      // --- INTENT: Humidity ---
      case 'humidity': {
        toolName = 'get_humidity()';
        const h = await AiPlatformTools.get_humidity();
        toolSummary = `Humidity: ${h.relativeHumidity}%, Status: ${h.status}`;

        if (lang === 'hi') {
          replyText = `कक्ष की सापेक्ष आर्द्रता ${h.relativeHumidity}% (सामान्य) है। यह नमी सब्जियों को सूखने से बचाने के लिए आदर्श है।`;
        } else if (lang === 'hinglish') {
          replyText = `Cold room humidity abhi ${h.relativeHumidity}% hai jo veggies ki freshness ke liye ekdum normal aur stable hai.`;
        } else {
          replyText = `Chamber relative humidity is ${h.relativeHumidity}% (Normal, optimal range 70-85%). Automatic humidity control is active.`;
        }
        break;
      }

      // --- INTENT: Inventory ---
      case 'inventory': {
        toolName = 'get_inventory()';
        const inv = await AiPlatformTools.get_inventory();
        toolSummary = `Batches: ${inv.totalBatches}, Weight: ${inv.totalWeightKg}kg, Value: ₹${inv.totalValueInr}`;

        if (lang === 'hi') {
          replyText = `आपके पास कुल 7 फसल बैच (${inv.totalWeightKg} kg) भंडारित हैं, जिनका अनुमानित मंडी मूल्य ₹${inv.totalValueInr.toLocaleString('en-IN')} है। मुख्य फसलें: टमाटर 120 kg, आलू 80 kg, प्याज 50 kg, गाजर 40 kg, फूलगोभी 25 kg, सेब 15 kg, मटर 12 kg।`;
        } else if (lang === 'hinglish') {
          replyText = `Aapke storage me 7 crop batches (${inv.totalWeightKg} kg) hain jinki total mandi value ₹${inv.totalValueInr.toLocaleString('en-IN')} hai. Tomatoes (120kg), Potato (80kg) aur Onion (50kg) main crops hain.`;
        } else {
          replyText = `You currently have 7 crop batches (${inv.totalWeightKg} kg) stored with an estimated market value of ₹${inv.totalValueInr.toLocaleString('en-IN')}. Main crops: Tomatoes (120 kg), Potatoes (80 kg), Onions (50 kg), Carrots (40 kg), Cauliflower (25 kg).`;
        }

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
        break;
      }

      // --- INTENT: Storage Booking ---
      case 'storage_booking': {
        toolName = 'get_booking_status()';
        const bk = await AiPlatformTools.get_booking_status();
        toolSummary = `Slots: ${bk.occupiedSlots}/${bk.totalSlots}, Space: ${bk.availableCapacityKg}kg`;

        if (lang === 'hi') {
          replyText = `कोल्ड स्टोरेज बुकिंग समर्थित है। वर्तमान में ${bk.availableCapacityKg} kg क्षमता तत्काल आरक्षण के लिए उपलब्ध है। ऐप में 'Add Crop' बटन दबाकर फसल और वजन दर्ज करके स्थान आरक्षित किया जा सकता है।`;
        } else if (lang === 'hinglish') {
          replyText = `Storage booking bilkul supported hai. Current available capacity ${bk.availableCapacityKg} kg hai. Aap app ke Inventory section me jaakar naya crop slot book kar sakte hain.`;
        } else {
          replyText = `Storage booking is fully supported on the platform. There is currently ${bk.availableCapacityKg} kg of capacity available for immediate reservation. You can book space directly by selecting produce and entering quantity in the Inventory section.`;
        }
        break;
      }

      // --- INTENT: Alerts ---
      case 'alerts': {
        toolName = 'get_alerts()';
        const al = await AiPlatformTools.get_alerts();
        toolSummary = `Active Alerts: ${al.activeAlertsCount}`;

        if (lang === 'hi') {
          replyText = `वर्तमान में ${al.activeAlertsCount} सक्रिय सूचनाएं हैं। मुख्य चेतावनी: फूलगोभी की शेल्फ लाइफ 6 दिन बची है, इसे 3 दिनों में मंडी निकासी करने की सलाह है।`;
        } else if (lang === 'hinglish') {
          replyText = `Abhi ${al.activeAlertsCount} active alerts hain. Main alert: Cauliflower ki shelf life 6 din bachi hai, use 3 din me market bechne ki recommendation hai.`;
        } else {
          replyText = `You have ${al.activeAlertsCount} active notifications. Key alert: Cauliflower shelf life is reducing (6 days left)—recommend dispatch within 3 days.`;
        }
        break;
      }

      // --- INTENT: Architecture / RAG Knowledge Retrieval ---
      case 'architecture':
      case 'platform_help':
      case 'faq':
      default: {
        // Semantic matching across RAG knowledge base
        const lowerQ = userQuery.toLowerCase();
        const queryWords = lowerQ.split(/[\s,?.!]+/).filter(w => w.length > 2);
        let bestChunk = RAG_KNOWLEDGE_BASE[0];
        let maxScore = -1;

        for (const chunk of RAG_KNOWLEDGE_BASE) {
          let score = 0;
          
          // Exact keyword/phrase inclusion
          for (const kw of chunk.keywords) {
            if (lowerQ.includes(kw)) {
              score += 10;
            } else if (queryWords.some(qw => kw.includes(qw) || qw.includes(kw))) {
              score += 2;
            }
          }

          // Category/feature relevance
          if (classification.intent === 'architecture' && chunk.category === 'architecture') {
            score += 15;
          } else if (classification.intent === 'platform_help' && (chunk.category === 'policy' || chunk.category === 'booking_workflow')) {
            score += 15;
          }

          if (score > maxScore) {
            maxScore = score;
            bestChunk = chunk;
          }
        }

        retrievedChunkIds.push(bestChunk.id);

        if (lang === 'hi') {
          replyText = bestChunk.contentHi;
        } else if (lang === 'hinglish') {
          replyText = bestChunk.contentHinglish;
        } else {
          replyText = bestChunk.contentEn;
        }
        break;
      }
    }

    const latencyMs = Date.now() - startTime;
    const spokenText = VoiceService.formatForSpeech(replyText, lang);

    const trace: AIExecutionTrace = {
      query: userQuery,
      timestamp: new Date().toLocaleTimeString(),
      detectedLanguage: lang,
      scope: 'IN_SCOPE',
      intent: classification.intent,
      securityFlag: false,
      retrievedChunks: retrievedChunkIds,
      toolExecuted: toolName,
      toolResultSummary: toolSummary,
      latencyMs,
      isVoice,
      sttLatencyMs: voiceMetrics?.sttLatencyMs,
      voiceTranscript: voiceMetrics?.voiceTranscript,
      spokenResponse: spokenText,
    };

    this.executionLogs.push(trace);

    return {
      text: replyText,
      card,
      spokenText,
      trace,
    };
  }
}
