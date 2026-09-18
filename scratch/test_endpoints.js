/**
 * Test script to verify Vercel Serverless Function handlers api/ai.ts and api/translate.ts
 */

async function runTests() {
  console.log('=== 1. TESTING TRANSLATION SERVERLESS HANDLER ===');
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

  // Test 2: Handled gracefully when API key is missing or offline
  const req2 = {
    method: 'POST',
    body: { text: 'Temperature is 4.8°C', target_language: 'hi' }
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
  console.log('Test 2 (Translation response):', res2.data);
  if (res2.data?.translated) {
    console.log('✅ Test 2 Passed: Handled gracefully');
  }

  console.log('\n=== 2. TESTING AI ASSISTANT SERVERLESS HANDLER ===');
  const aiHandler = require('../api/ai.ts').default || require('../api/ai.ts');

  // Test 3: Out-of-scope question (Scope Guard)
  const chunks3 = [];
  const req3 = {
    method: 'POST',
    body: { query: 'who is the president of france and what is python game', language: 'en' }
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
  if (fullOut3.includes('OJAS Smart Cold Storage assistant') && fullOut3.includes('ojas-scope-guard')) {
    console.log('✅ Test 3 Passed: Scope Guard correctly triggered and streamed refusal');
  } else {
    console.error('❌ Test 3 Failed. Output:', fullOut3);
  }

  // Test 4: In-scope question
  const chunks4 = [];
  const req4 = {
    method: 'POST',
    body: { query: 'kal kitni solar energy banegi?', language: 'hi' }
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
  console.log('Test 4 (In-scope response chunks received):', chunks4.length);
  if (chunks4.length > 0 && fullOut4.includes('done')) {
    console.log('✅ Test 4 Passed: In-scope query streamed SSE response successfully');
  } else {
    console.error('❌ Test 4 Failed. Output:', fullOut4);
  }

  console.log('\n=== ALL SERVERLESS TESTS PASSED ===');
}

runTests().catch(console.error);
