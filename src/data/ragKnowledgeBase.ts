import { RAGKnowledgeChunk } from '../types/ai';

export const RAG_KNOWLEDGE_BASE: RAGKnowledgeChunk[] = [
  // 1. System Architecture
  {
    id: 'arch-overview',
    title: 'Smart Cold Storage System Architecture',
    titleHi: 'स्मार्ट कोल्ड स्टोरेज प्रणाली संरचना',
    category: 'architecture',
    feature: 'system_design',
    contentEn: 'The Smart Cold Storage platform is an AI-powered, renewable-energy cold chain ecosystem. The core data & energy pipeline follows: Weather Data → ML Solar & Wind Generation Prediction → Energy Demand Prediction → Battery State Management → Energy Optimization → Recommended Storage Capacity Calculation → Multi-Zone Cold Room Management → Farmer Mobile Application.',
    contentHi: 'स्मार्ट कोल्ड स्टोरेज प्लेटफॉर्म एक एआई-संचालित, नवीकरणीय ऊर्जा आधारित कोल्ड चेन इकोसिस्टम है। मुख्य पाइपलाइन: मौसम डेटा → एमएल सौर व पवन ऊर्जा उत्पादन पूर्वानुमान → ऊर्जा मांग पूर्वानुमान → बैटरी स्थिति प्रबंधन → ऊर्जा अनुकूलन → अनुशंसित भंडारण क्षमता गणना → मल्टी-ज़ोन कोल्ड रूम प्रबंधन → किसान मोबाइल ऐप।',
    contentHinglish: 'Smart Cold Storage platform ek AI-powered renewable cold chain ecosystem hai. Core pipeline: Weather Data → ML Generation Prediction → Cooling Demand Forecast → Battery State → Energy Optimization → Recommended Storage Capacity Calculation → Cold Room Management → Farmer App.',
    keywords: ['architecture', 'how it works', 'pipeline', 'workflow', 'system', 'overview', 'संरचना', 'कैसे काम करता है', 'kaise kaam karta hai'],
  },

  // 2. Hardware Specs
  {
    id: 'hardware-vawt-battery',
    title: 'Renewable Power & Battery Storage Hardware',
    titleHi: 'नवीकरणीय ऊर्जा और बैटरी भंडारण हार्डवेयर',
    category: 'hardware',
    feature: 'energy_hardware',
    contentEn: 'The unit is equipped with a 3.0 kW Vertical Axis Wind Turbine (VAWT) and high-efficiency solar photovoltaic inputs, coupled to an intelligent MPPT charge controller and a 48V 100Ah (4.8 kWh) LiFePO4 battery pack with 6,000+ cycle life. It provides 36+ hours of autonomous off-grid cooling without diesel generator backup.',
    contentHi: 'यह इकाई 3.0 kW वर्टिकल एक्सिस विंड टर्बाइन (VAWT) और उच्च दक्षता वाले सौर पैनलों से सुसज्जित है। इसमें एक बुद्धिमान MPPT चार्ज कंट्रोलर और 48V 100Ah (4.8 kWh) LiFePO4 बैटरी पैक लगा है जो बिना डीजल जनरेटर के 36+ घंटे का ऑफ-ग्रिड बैकअप प्रदान करता है।',
    contentHinglish: 'Isme 3.0 kW Vertical Axis Wind Turbine (VAWT), high-efficiency solar inputs, smart MPPT controller aur 48V 100Ah (4.8 kWh) LiFePO4 battery pack laga hai jo 36+ ghante ka continuous off-grid cooling reserve deta hai.',
    keywords: ['hardware', 'vawt', 'turbine', 'wind', 'solar', 'lifepo4', 'battery', 'generator', 'हार्डवेयर', 'पवन चक्की', 'बैटरी बैकअप'],
  },

  // 3. Multi-Zone Thermal Chambers
  {
    id: 'hardware-zones',
    title: 'Multi-Zone Thermal Chambers & Cooling Sensors',
    titleHi: 'मल्टी-ज़ोन थर्मल कक्ष और शीतलन सेंसर',
    category: 'hardware',
    feature: 'cooling_zones',
    contentEn: 'The chamber is divided into three distinct thermal zones: Zone A (Upper Shelf: 5.0-6.0°C for Tomatoes, Brinjals, Cucumbers), Zone B (Middle Shelf: 4.0-5.0°C for Capsicum, Carrots, Beans), and Zone C (Lower Cold Core: 2.0-3.5°C for Leafy Greens, Peas, Cauliflower). Real-time IoT sensors monitor temperature, relative humidity, and ethylene (C2H4) gas levels.',
    contentHi: 'कोल्ड रूम तीन अलग-अलग थर्मल ज़ोन में बंटा है: ज़ोन A (ऊपरी रैक: 5.0-6.0°C टमाटर व बैंगन के लिए), ज़ोन B (मध्य रैक: 4.0-5.0°C शिमला मिर्च व गाजर के लिए), और ज़ोन C (निचला कोल्ड कोर: 2.0-3.5°C पत्तेदार सब्जियों व फूलगोभी के लिए)। IoT सेंसर तापमान, नमी और एथिलीन गैस की लगातार निगरानी करते हैं।',
    contentHinglish: 'Cold chamber 3 zones me divide hai: Zone A (Upper Shelf: 5.0-6.0°C Tomatoes ke liye), Zone B (Middle Shelf: 4.0-5.0°C Carrots/Capsicum ke liye), Zone C (Lower Core: 2.0-3.5°C Cauliflower/Peas ke liye). IoT sensors temp, humidity aur ethylene monitor karte hain.',
    keywords: ['zones', 'racks', 'shelves', 'zone a', 'zone b', 'zone c', 'chamber', 'ज़ोन', 'रैक', 'cold room'],
  },

  // 4. ML Energy Forecasting
  {
    id: 'ml-energy-forecasting',
    title: 'ML-Based Renewable Energy & Demand Forecasting',
    titleHi: 'एमएल-आधारित नवीकरणीय ऊर्जा और मांग पूर्वानुमान',
    category: 'energy_ml',
    feature: 'energy_prediction',
    contentEn: 'The platform employs an ML regression & time-series model that ingests weather parameters (solar irradiance, ambient temperature, humidity, cloud cover, wind velocity), solar/wind panel capacity, current battery state of charge (SOC), cold-storage load, stored crop respiration, and historical consumption. It outputs next-day expected solar/wind generation (e.g. 38.6 kWh), expected cooling demand (26.4 kWh), and net energy surplus/deficit.',
    contentHi: 'प्लेटफॉर्म एक एमएल रिग्रेशन मॉडल का उपयोग करता है जो मौसम पूर्वानुमान (सौर विकिरण, परिवेश तापमान, आर्द्रता, बादल, हवा की गति), बैटरी चार्ज स्थिति (SOC) और फसलों के थर्मल भार का विश्लेषण करता है। यह अगले दिन के संभावित ऊर्जा उत्पादन (38.6 kWh), शीतलन मांग (26.4 kWh) और सरप्लस का सटीक पूर्वानुमान देता है।',
    contentHinglish: 'Platform ka ML forecasting model weather (solar irradiance, wind speed, temp, cloud cover) aur battery SOC ke basis par kal ka expected renewable generation (38.6 kWh) aur expected cooling demand (26.4 kWh) predict karta hai.',
    keywords: ['energy forecast', 'solar forecast', 'prediction', 'ml', 'bijli forecast', 'पूर्वानुमान', 'सौर उत्पादन', 'bijli banegi'],
  },

  // 5. Recommended Storage Capacity Formula
  {
    id: 'math-storage-capacity',
    title: 'Recommended Additional Storage Capacity Calculation',
    titleHi: 'अनुशंसित अतिरिक्त भंडारण क्षमता गणना विधि',
    category: 'capacity_math',
    feature: 'capacity_calculation',
    contentEn: 'Storage capacity calculation formula: (Available Renewable Energy + Usable Battery Energy + Permitted Grid Energy) - Expected Base Cooling Demand = Net Available Energy for Additional Storage. This net energy is divided by the specific heat & pull-down energy required per kg of produce, bounded by physical chamber volume (500 kg max) and current inventory (342 kg current load -> 158 kg physical space remaining; 180 kg energy-safe recommendation).',
    contentHi: 'अतिरिक्त भंडारण क्षमता गणना सूत्र: (उपलब्ध नवीकरणीय ऊर्जा + उपयोगी बैटरी ऊर्जा + अनुमत ग्रिड ऊर्जा) - प्रत्याशित शीतलन मांग = अतिरिक्त भंडारण के लिए शुद्ध उपलब्ध ऊर्जा। इसे प्रति किलो फसल की विशिष्ट ऊष्मा और 500 किग्रा की भौतिक क्षमता सीमा के साथ संयोजित किया जाता है।',
    contentHinglish: 'Storage capacity calculation: (Available Clean Energy + Usable Battery Energy) - Cooling Demand = Surplus Energy for Additional Produce. Current conditions ke according 180 kg additional produce energy-wise safe hai, jabki physical space 158 kg bachi hai.',
    keywords: ['capacity', 'kitna maal', 'how much can i store', 'storage capacity', 'calculation', 'formula', 'कितना माल', 'भंडारण क्षमता'],
  },

  // 6. Crop Storage Parameters & Freshness Rules
  {
    id: 'crop-storage-rules',
    title: 'Optimal Crop Storage Parameters & Ethylene Guidelines',
    titleHi: 'फसल भंडारण के अनुकूलतम नियम और एथिलीन दिशा-निर्देश',
    category: 'crop_rules',
    feature: 'crop_preservation',
    contentEn: 'Crop parameters: Tomatoes (4.0-5.5°C, 75-85% RH, shelf life up to 24 days; sell when freshness drops below 80%), Potatoes (5.0-7.0°C, 85-90% RH, shelf life 120 days), Onions (4.5-6.0°C, 65-70% low RH to prevent sprouting), Cauliflower (2.0-4.0°C, 85-90% RH, sensitive to moisture loss), Apples (3.5-5.0°C, high ethylene emitter - store separate from greens), Green Peas (2.0-3.5°C, high respiration).',
    contentHi: 'फसल नियम: टमाटर (4.0-5.5°C, 75-85% आर्द्रता, 24 दिन तक सुरक्षित), आलू (5.0-7.0°C, 85-90% आर्द्रता, 120 दिन), प्याज (4.5-6.0°C, कम आर्द्रता 65-70%), फूलगोभी (2.0-4.0°C, 16 दिन), सेब (3.5-5.0°C, एथिलीन उत्सर्जक - पत्तेदार सब्जियों से अलग रखें), हरी मटर (2.0-3.5°C)।',
    contentHinglish: 'Crop storage guidelines: Tomatoes 4-5.5°C (24 days shelf life), Potatoes 5-7°C (120 days), Onions 4.5-6°C (low RH to prevent sprouting), Cauliflower 2-4°C (moisture sensitive), Apples 3.5-5°C (store separate due to ethylene gas).',
    keywords: ['crop rules', 'shelf life', 'tomato', 'potato', 'onion', 'cauliflower', 'apple', 'peas', 'tamatar', 'aalu', 'pyaz', 'टमाटर', 'आलू', 'प्याज', 'फूलगोभी'],
  },

  // 7. Spoilage Risk Model
  {
    id: 'ml-spoilage-risk',
    title: 'AI Spoilage Risk Prediction Model',
    titleHi: 'एआई फसल सड़न जोखिम पूर्वानुमान मॉडल',
    category: 'spoilage_model',
    feature: 'spoilage_prediction',
    contentEn: 'The spoilage prediction engine evaluates real-time sensor history (temperature standard deviation, relative humidity spikes, ethylene concentration > 1.0 ppm) combined with storage duration and crop respiration index. If spoilage risk exceeds 20%, the system alerts the farmer with an immediate mandi dispatch recommendation.',
    contentHi: 'सड़न जोखिम पूर्वानुमान प्रणाली तापमान में उतार-चढ़ाव, अत्यधिक आर्द्रता और एथिलीन सांद्रता (> 1.0 ppm) का विश्लेषण करती है। यदि सड़न जोखिम 20% से अधिक होता है, तो सिस्टम किसान को तत्काल मंडी में बेचने की चेतावनी जारी करता है।',
    contentHinglish: 'Spoilage risk engine real-time temp variance, high humidity aur ethylene gas level monitor karta hai. Jab spoilage risk 20% se upar jata hai, to app turant Mandi Dispatch alert bhejta hai.',
    keywords: ['spoilage', 'rot', 'decay', 'risk', 'kharab', 'freshness', 'सड़न', 'खराब', 'ताजगी'],
  },

  // 8. Battery Assistance & Optimization
  {
    id: 'battery-optimization',
    title: 'Battery Health & Energy Saving Modes',
    titleHi: 'बैटरी स्वास्थ्य और ऊर्जा बचत मोड',
    category: 'hardware',
    feature: 'battery_management',
    contentEn: 'The LiFePO4 battery pack operates between 20% and 95% state of charge (SOC) for optimal chemical longevity. To conserve battery: 1) Keep cold room doors closed to prevent thermal ingress; 2) Pre-cool produce during peak daytime generation hours (11:00-15:00); 3) The system automatically switches to ECO-Mode if battery drops below 35%.',
    contentHi: 'बैटरी दीर्घायु के लिए 20% से 95% SOC के बीच काम करती है। बैटरी बचाने के लिए: 1) कमरे का दरवाजा कम से कम खोलें; 2) दिन में तेज धूप व हवा के समय (11:00-15:00) फसल लोड करें; 3) 35% से कम बैटरी होने पर सिस्टम अपने आप इको-मोड में चला जाता है।',
    contentHinglish: 'Battery longevity ke liye: 1) Cold room ka door bar-bar na kholein; 2) Peak renewable generation hours (11 AM - 3 PM) me pre-cooling karein; 3) Battery 35% se niche jane par auto Eco-Mode active ho jata hai.',
    keywords: ['battery tips', 'save battery', 'battery bachayein', 'eco mode', 'battery health', 'बैटरी बचत', 'बैटरी बचाएं'],
  },

  // 9. Storage Booking Workflow
  {
    id: 'booking-workflow',
    title: 'Storage Space Booking & Slot Reservation Workflow',
    titleHi: 'कोल्ड स्टोरेज स्पेस बुकिंग और स्लॉट आरक्षण प्रक्रिया',
    category: 'booking_workflow',
    feature: 'storage_booking',
    contentEn: 'Farmers can reserve cold storage capacity directly via the app: 1) Select produce category (Tomato, Potato, Cauliflower, etc.); 2) Enter weight in kg; 3) System calculates energy compatibility and optimal thermal zone; 4) Slot is reserved with a digital QR check-in token. Real-time availability reflects instantly on the dashboard.',
    contentHi: 'किसान ऐप के माध्यम से कोल्ड स्टोरेज स्पेस बुक कर सकते हैं: 1) फसल का चयन करें; 2) वजन (किग्रा) दर्ज करें; 3) सिस्टम ऊर्जा अनुकूलता और उपयुक्त ज़ोन की पुष्टि करता है; 4) डिजिटल क्यूआर चेक-इन टोकन जारी होता है।',
    contentHinglish: 'Storage booking process: 1) Crop select karein; 2) Weight (kg) enter karein; 3) App energy aur zone availability verify karega; 4) QR Check-in token ke sath slot book ho jayega.',
    keywords: ['booking', 'book storage', 'reserve', 'slot', 'space', 'बुकिंग', 'जगह बुक करें', 'booking kaise karein'],
  },

  // 10. Platform Supported Schemes & Policies
  {
    id: 'gov-schemes-support',
    title: 'Supported Agro Government Schemes & Subsidies',
    titleHi: 'समर्थित कृषि सरकारी योजनाएं और सब्सिडी',
    category: 'policy',
    feature: 'subsidies',
    contentEn: 'The Smart Cold Storage platform is compliant with PM-KUSUM (Component-C for renewable agro-power) and the PM Formalisation of Micro food processing Enterprises (PM-FME) scheme, providing up to 35% capital subsidy for farmer producer organizations (FPOs) and individual smallholders installing hybrid cold chains.',
    contentHi: 'यह स्मार्ट कोल्ड स्टोरेज प्लेटफॉर्म पीएम-कुसुम (PM-KUSUM) और पीएम-एफएमई (PM-FME) योजना के अनुरूप है, जिसके तहत एफपीओ और किसान भाइयों को हाइब्रिड कोल्ड स्टोरेज पर 35% तक की सब्सिडी सहायता मिल सकती है।',
    contentHinglish: 'Smart Cold Storage platform PM-KUSUM aur PM-FME scheme compliant hai, jisme FPOs aur smallholder farmers ko 35% tak ki capital subsidy ka support milta hai.',
    keywords: ['scheme', 'subsidy', 'pm kusum', 'pm fme', 'government', 'subsidi', 'सरकारी योजना', 'सब्सिडी'],
  },

  // 11. Platform FAQs & Security
  {
    id: 'faq-security',
    title: 'Platform Security, Privacy & Data Isolation',
    titleHi: 'प्लेटफॉर्म सुरक्षा, गोपनीयता और डेटा पृथक्करण',
    category: 'faq',
    feature: 'security',
    contentEn: 'Farmer data, inventory weights, telemetry logs, and private market transactions are encrypted and isolated per storage unit ID. Access is strictly authorized for the registered farmer and designated cold room operator. No unauthorized external access is permitted.',
    contentHi: 'किसान का व्यक्तिगत डेटा, फसल मात्रा और टेलीमेट्री लॉग पूरी तरह एन्क्रिप्टेड और सुरक्षित हैं। केवल पंजीकृत किसान और अधिकृत ऑपरेटर ही अपनी यूनिट का डेटा देख सकते हैं।',
    contentHinglish: 'Aapka farmer inventory data, sensor readings aur storage logs completely encrypted aur secure hain. Sirf authorized account hi is data ko access kar sakta hai.',
    keywords: ['security', 'privacy', 'data', 'safe', 'सुरक्षा', 'गोपनीयता', 'privacy policy'],
  },
];
