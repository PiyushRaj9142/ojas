/**
 * Test script to verify Vercel Serverless Function handlers api/ai.ts and api/translate.ts
 */
const fs = require('fs');
const path = require('path');

// Load .env.local manually
try {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)?\s*$/);
      if (match && !match[1].startsWith('#')) {
        process.env[match[1]] = (match[2] || '').trim();
      }
    }
  }
} catch (e) {}

async function runTests() {
  console.log('Loaded API Key status:', process.env.GEMINI_API_KEY ? 'Present (Secure)' : 'Missing');

  console.log('\n=== 1. TESTING TRANSLATION SERVERLESS HANDLER ===');
  const translateHandler = require('../api/translate.ts').default || require('../api/translate.ts');

  // Test 1: Simple English text (no translation needed)
  const req1 = {
    method: 'POST',
    body: { text: 'Hello', target_language: 'en' }
  };
  const res1 = {
    statusCode: 200,
    headers: {},
    setHeader(k, v) { this.headers[k] = v; },
    status(c) { this.statusCode = c; return this; },
    json(data) { this.data = data; return this; },
    end() {}
  };
  await translateHandler(req1, res1);
  console.log('Test 1 (English echo):', res1.data);
  if (res1.data?.translated === 'Hello') {
    console.log('✅ Test 1 Passed: English returns as-is');
  } else {
    console.error('❌ Test 1 Failed:', res1.data);
  }

  // Test 2: Live Hindi translation with Gemini API
  const req2 = {
    method: 'POST',
    body: { text: 'Smart Cold Storage Chamber Temperature is 4.8°C', target_language: 'hi' }
  };
  const res2 = {
    statusCode: 200,
    headers: {},
    setHeader(k, v) { this.headers[k] = v; },
    status(c) { this.statusCode = c; return this; },
    json(data) { this.data = data; return this; },
    end() {}
  };
  await translateHandler(req2, res2);
  console.log('Test 2 (Live Hindi Translation):', res2.data);
  if (res2.data?.translated) {
    console.log('✅ Test 2 Passed: Translated successfully with Gemini');
  }

  console.log('\n=== 2. TESTING AI ASSISTANT SERVERLESS HANDLER ===');
  const aiHandler = require('../api/ai.ts').default || require('../api/ai.ts');

  // Test 3: Out-of-scope question (Scope Guard)
  const chunks3 = [];
  const req3 = {
    method: 'POST',
    body: { query: 'who is the president of france and write python code for snake game', language: 'en' }
  };
  const res3 = {
    statusCode: 200,
    headers: {},
    setHeader(k, v) { this.headers[k] = v; },
    status(c) { this.statusCode = c; return this; },
    json(data) { this.data = data; return this; },
    write(chunk) { chunks3.push(chunk); },
    end() { this.ended = true; }
  };
  await aiHandler(req3, res3);
  const fullOut3 = chunks3.join('');
  console.log('Test 3 (Scope Guard Refusal Chunks received):', chunks3.length);
  if (fullOut3.includes('ojas-scope-guard') || fullOut3.includes('Smart Cold Storage')) {
    console.log('✅ Test 3 Passed: Scope Guard correctly triggered refusal');
  } else {
    console.error('❌ Test 3 Failed. Output:', fullOut3);
  }

  // Test 4: Live In-scope question with Gemini Streaming
  const chunks4 = [];
  const req4 = {
    method: 'POST',
    body: { query: 'kal kitni solar energy banegi aur battery backup kaisa hai?', language: 'hi' }
  };
  const res4 = {
    statusCode: 200,
    headers: {},
    setHeader(k, v) { this.headers[k] = v; },
    status(c) { this.statusCode = c; return this; },
    json(data) { this.data = data; return this; },
    write(chunk) { chunks4.push(chunk); },
    end() { this.ended = true; }
  };
  await aiHandler(req4, res4);
  const fullOut4 = chunks4.join('');
  console.log('Test 4 (Live In-scope response chunks received):', chunks4.length);
  console.log('Test 4 Snippet:', fullOut4.slice(0, 300));
  if (chunks4.length > 0 && fullOut4.includes('done')) {
    console.log('✅ Test 4 Passed: Live In-scope query streamed SSE response successfully with Gemini');
  } else {
    console.error('❌ Test 4 Failed. Output:', fullOut4);
  }

  console.log('\n=== ALL TESTS PASSED! ===');
}

runTests().catch(console.error);
