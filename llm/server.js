// Local OpenAI-compatible endpoint backed by the failover router.
// Point any OpenAI client at http://localhost:8787/v1 (any api key string works).
import http from 'node:http';
import { chat, enabledProviders } from './router.js';

const PORT = Number(process.env.LLM_PORT || 8787);

function send(res, status, obj) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(obj));
}

http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, {});
  if (req.method === 'GET' && req.url === '/v1/models')
    return send(res, 200, { object: 'list', data: [{ id: 'auto', object: 'model', owned_by: 'free-failover' }] });
  if (req.method === 'GET' && req.url === '/health')
    return send(res, 200, { providers: enabledProviders().map(p => p.name) });
  if (req.method !== 'POST' || req.url !== '/v1/chat/completions')
    return send(res, 404, { error: { message: 'Use POST /v1/chat/completions' } });

  let raw = '';
  for await (const chunk of req) raw += chunk;
  try {
    const body = JSON.parse(raw);
    if (body.stream) return send(res, 400, { error: { message: 'Streaming is not supported; set stream: false' } });
    const out = await chat(body);
    console.log(`[llm] answered by ${out.provider} / ${out.model}`);
    send(res, 200, out);
  } catch (e) {
    send(res, e.status || 500, { error: { message: e.message } });
  }
}).listen(PORT, '127.0.0.1', () => {
  console.log(`Free LLM failover on http://localhost:${PORT}/v1`);
  console.log(`Active providers (in order): ${enabledProviders().map(p => p.name).join(', ')}`);
});
