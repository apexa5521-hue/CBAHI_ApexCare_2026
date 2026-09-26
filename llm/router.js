// Failover router: sends an OpenAI-style chat request to the first provider
// that works. Rate-limited or out-of-credit providers are put on cooldown and
// skipped until it expires; invalid keys are skipped for the rest of the run.
import { providers } from './providers.js';

const TIMEOUT_MS = Number(process.env.LLM_TIMEOUT_MS || 60_000);
const cooldownUntil = new Map(); // provider name -> timestamp
const deadModels = new Set();    // "provider|model" that returned model-not-found

export function enabledProviders() {
  return providers.filter(p =>
    (p.keyless || process.env[p.keyEnv]) && (p.extraEnv || []).every(e => process.env[e]));
}

function cooldownMs(status, headers) {
  const retry = Number(headers.get('retry-after'));
  if (retry > 0) return retry * 1000;
  if (status === 429) return 60_000;          // per-minute limit, or daily quota
  if (status === 402) return 6 * 3600_000;    // out of credits
  return 30_000;                              // 5xx / timeout / network
}

async function callProvider(p, model, body) {
  const baseUrl = typeof p.baseUrl === 'function' ? p.baseUrl() : p.baseUrl;
  const headers = { 'Content-Type': 'application/json' };
  const key = p.keyEnv && process.env[p.keyEnv];
  if (key) headers.Authorization = `Bearer ${key}`;
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST', headers,
    body: JSON.stringify({ ...body, model, stream: false }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const text = await res.text();
  let json; try { json = JSON.parse(text); } catch { json = null; }
  return { res, json, text };
}

/**
 * chat({ messages, max_tokens, temperature, ... }) -> OpenAI chat.completion JSON
 * plus `provider` and `model` fields saying who answered.
 * Pass `providers: ['Groq', ...]` to restrict which ones are tried.
 */
export async function chat(body, { only, log = console.error } = {}) {
  const { providers: _ignored, model: _m, ...req } = body;
  const errors = [];
  for (const p of enabledProviders()) {
    if (only && !only.includes(p.name)) continue;
    if ((cooldownUntil.get(p.name) || 0) > Date.now()) { errors.push(`${p.name}: cooling down`); continue; }

    for (const model of p.models) {
      if (deadModels.has(`${p.name}|${model}`)) continue;
      let r;
      try {
        r = await callProvider(p, model, req);
      } catch (e) {
        errors.push(`${p.name}/${model}: ${e.name === 'TimeoutError' ? 'timeout' : e.message}`);
        cooldownUntil.set(p.name, Date.now() + 30_000);
        break;
      }
      const { res, json, text } = r;
      const content = json?.choices?.[0]?.message;
      if (res.ok && content) return { ...json, provider: p.name, model };

      const msg = `${p.name}/${model}: HTTP ${res.status} ${text.slice(0, 160).replace(/\s+/g, ' ')}`;
      errors.push(msg);
      log(`[llm] ${msg} -> trying next`);

      if (res.status === 401 || res.status === 403) {        // bad key / not allowed: skip provider this run
        cooldownUntil.set(p.name, Infinity); break;
      }
      if (res.status === 429 || res.status === 402 || res.status >= 500) {
        // Quota may be per-model (Groq, OpenRouter), so try the provider's other models first.
        if (p.models.indexOf(model) === p.models.length - 1)
          cooldownUntil.set(p.name, Date.now() + cooldownMs(res.status, res.headers));
        continue;
      }
      if (res.status === 404 || res.status === 400 && /model/i.test(text)) {
        deadModels.add(`${p.name}|${model}`); continue;       // model retired or renamed
      }
      if (res.status === 400) {                               // our request is bad; no point trying others
        const err = new Error(msg); err.status = 400; err.body = json || text; throw err;
      }
    }
  }
  const err = new Error(`All free LLM providers failed:\n  ${errors.join('\n  ') || 'no providers configured'}`);
  err.status = 503;
  throw err;
}
