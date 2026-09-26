# Free LLM failover

Uses all the free LLM APIs from [awesome-free-llm-apis](https://github.com/mnfst/awesome-free-llm-apis).
Each request goes to the first provider in `providers.js`. If that provider hits
a rate limit (429), runs out of credit (402), rejects the key (401/403), fails
or times out, the next model or provider takes over automatically. Kilo Code,
LLM7.io and OVHcloud need no key, so something always answers.

## Setup (Node 20.6+)

1. `cp .env.example .env` in the repo root and paste in the keys you have (sign-up links are next to each).
2. `cd llm && npm run check` shows which providers work.
3. `npm start` runs a local OpenAI-compatible endpoint at `http://localhost:8787/v1`.

## Use it

Any OpenAI client works with the base URL `http://localhost:8787/v1`, any API key and the model `auto`:

```bash
curl http://localhost:8787/v1/chat/completions -H 'Content-Type: application/json' \
  -d '{"model":"auto","messages":[{"role":"user","content":"Hello"}]}'
```

The response includes `provider` and `model` fields showing which one answered.
To use it from Node code instead: `import { chat } from './llm/router.js'`.

Notes: streaming is not supported. Cohere's free key is for non-commercial use only.
Gemini, Mistral and a few others may use free-tier prompts for training, so don't
send patient data through the free tiers.
