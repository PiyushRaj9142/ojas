export interface AIKnowledgeItem {
  keywords: string[];
  responseEn: string;
  responseHi: string;
  responseHinglish: string;
}

export const AI_SUGGESTED_CHIPS = [
  { id: 'check-storage', label: '🌡 Check Storage', labelHi: '🌡 स्टोरेज स्थिति', query: 'What is the current storage health and temperature?' },
  { id: 'check-battery', label: '🔋 Check Battery', labelHi: '🔋 बैटरी बैकअप', query: 'How much battery backup is left?' },
  { id: 'crop-advice', label: '🥬 Crop Advice', labelHi: '🥬 फसल सलाह', query: 'Tomato kitne din tak fresh rahega?' },
  { id: 'selling-advice', label: '💰 Selling Advice', labelHi: '💰 मंडी बिक्री सलाह', query: 'Kaunsi crop pehle sell karni chahiye?' },
  { id: 'energy-status', label: '⚡ Energy Status', labelHi: '⚡ बिजली बचत', query: 'Bijli kitni save hui wind energy se?' },
];

export const AI_KNOWLEDGE_BASE: AIKnowledgeItem[] = [
  {
    keywords: ['tomato', 'tamatar', 'टमाटर', 'fresh', 'shelf'],
    responseEn: 'Your Tomatoes (120 kg) are at 92% freshness with 8 days of shelf life remaining at 4.8°C. AI recommendation: Sell within 5 days to capture peak market rates.',
    responseHi: 'आपके टमाटर (120 kg) 4.8°C तापमान पर 92% ताजगी के साथ सुरक्षित हैं। 8 दिन की शेल्फ लाइफ शेष है। सुझाव: अधिकतम लाभ के लिए 5 दिनों में बेचें।',
    responseHinglish: 'Aapke Tomatoes (120 kg) 4.8°C par 92% freshness ke sath mast store hain. 8 days ki shelf life bachi hai. Highest profit ke liye 5 din ke andar sell karna best rahega.',
  },
  {
    keywords: ['temperature', 'temp', 'tapman', 'तापमान', 'safe'],
    responseEn: 'The core chamber temperature is 4.8°C (Optimal). All thermal racks and ventilation fans are functioning properly with 0% risk of chill injury.',
    responseHi: 'मुख्य कोल्ड रूम का तापमान 4.8°C (उत्तम) है। सभी रैक और पंखे सुरक्षित रूप से चल रहे हैं और कोई शीतलन क्षति नहीं है।',
    responseHinglish: 'Cold storage ka temperature abhi 4.8°C hai jo ekdum optimal hai. Sabhi racks me cooling sahi chal rahi hai.',
  },
  {
    keywords: ['battery', 'charge', 'power', 'backup', 'बैटरी'],
    responseEn: 'Battery SOC is 82% (48.4V). VAWT wind turbine is producing 2.4 kW against 1.6 kW cooling load. Battery has 36+ hours of autonomous reserve.',
    responseHi: 'बैटरी 82% चार्ज है। पवन टर्बाइन 2.4 kW बिजली बना रहा है जबकि शीतलन में 1.6 kW लग रहा है। 36+ घंटे का बैकअप उपलब्ध है।',
    responseHinglish: 'Battery abhi 82% charged hai aur wind turbine se 2.4 kW power generate ho rahi hai. 36+ hours ka solid backup hai.',
  },
  {
    keywords: ['sell', 'pehle', 'market', 'mandi', 'बिक्री', 'kaunsi'],
    responseEn: 'Cauliflower (25 kg) has 6 days remaining and showing slight moisture loss. Sell Cauliflower first within 3 days, followed by Tomatoes.',
    responseHi: 'फूलगोभी (25 kg) की शेल्फ लाइफ केवल 6 दिन बची है। सबसे पहले फूलगोभी को 3 दिनों में बेचें, उसके बाद टमाटर बेचें।',
    responseHinglish: 'Pehle Cauliflower (Phoolgobhi) ko 3 din ke andar sell karein kyunki uski freshness kam ho rahi hai, fir 5 din me Tomatoes nikalna best hoga.',
  },
  {
    keywords: ['bijli', 'save', 'savings', 'electricity', 'रुपये', 'बचत'],
    responseEn: 'You generated 34.8 kWh of clean wind energy today, saving approx ₹295/day in grid power and ₹8,850/month, with 0 diesel generator dependency.',
    responseHi: 'आज आपने 34.8 kWh स्वच्छ पवन ऊर्जा बनाई, जिससे प्रतिदिन लगभग ₹295 और प्रति माह ₹8,850 की बिजली बचत हुई है।',
    responseHinglish: 'Aaj wind turbine se 34.8 kWh green electricity bani hai, jisse daily lagbhag ₹295 aur monthly ₹8,850 ki bijli bachat hui hai.',
  },
  {
    keywords: ['safe', 'status', 'health', 'सुरक्षित'],
    responseEn: 'Overall Cold Storage Health is 98% (Online). Clean renewable generation is positive (+0.8 kW surplus) and all crops are in Grade-A condition.',
    responseHi: 'कोल्ड स्टोरेज का स्वास्थ्य 98% (उत्कृष्ट) है। ऊर्जा उत्पादन सरप्लस में है और सभी फसलें सुरक्षित स्थिति में हैं।',
    responseHinglish: 'Haan, cold storage bilkul safe hai (Health 98%). Renewable power positive hai aur sari crops bilkul safe hain.',
  },
];
