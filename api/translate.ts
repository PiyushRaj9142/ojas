/**
 * Vercel Serverless Function: /api/translate
 * Secure server-side translation for 12 Indian languages using Gemini
 * without exposing private credentials to the client.
 */

const LANGUAGE_PROMPT_DESCRIPTIONS: Record<string, string> = {
  en: 'clear simple English',
  hi: 'natural Devanagari Hindi (हिन्दी) for Indian farmers',
  mr: 'natural Marathi (मराठी) for Maharashtra farmers',
  bn: 'natural Bengali (বাংলা) for farmers',
  te: 'natural Telugu (తెలుగు) for farmers',
  ta: 'natural Tamil (தமிழ்) for farmers',
  gu: 'natural Gujarati (ગુજરાતી) for farmers',
  kn: 'natural Kannada (ಕನ್ನಡ) for farmers',
  ml: 'natural Malayalam (മലയാളം) for farmers',
  pa: 'natural Punjabi (ਪੰਜਾਬੀ) for farmers',
  or: 'natural Odia (ଓଡ଼ିଆ) for farmers',
  hinglish: 'conversational Hinglish (Roman Hindi + English)',
};

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, target_language = 'hi' } = req.body || {};

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(200).json({ translated: '' });
  }

  if (target_language === 'en') {
    return res.status(200).json({ translated: text });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
  if (!apiKey) {
    // Return original text if key is not configured
    return res.status(200).json({ translated: text });
  }

  const targetDesc = LANGUAGE_PROMPT_DESCRIPTIONS[target_language.toLowerCase()] || target_language;
  const prompt = `Translate the following text into ${targetDesc}. Preserve all numbers, units (°C, kg, kW, %, ppm), technical terms, and crop names accurately. Return ONLY the translated string without quotes or explanations:\n\n${text}`;

  const candidateModels = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash'
  ];

  for (const model of candidateModels) {
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const geminiResp = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 250,
          },
        }),
      });

      if (geminiResp.ok) {
        const data = await geminiResp.json();
        const translated = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (translated) {
          return res.status(200).json({ translated });
        }
      }
    } catch {
      continue;
    }
  }

  // Fallback if all models failed
  return res.status(200).json({ translated: text });
}
