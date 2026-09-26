// Free LLM providers, tried top to bottom. A provider is used only if its
// key env var is set (or it is keyless). Reorder to change priority.
// Source: https://github.com/mnfst/awesome-free-llm-apis (data as of 2026-08-21)

export const providers = [
  { name: 'Groq',        baseUrl: 'https://api.groq.com/openai/v1',  keyEnv: 'GROQ_API_KEY',
    models: ['openai/gpt-oss-120b', 'qwen/qwen3.6-27b', 'openai/gpt-oss-20b'] },
  { name: 'Google Gemini', baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai', keyEnv: 'GEMINI_API_KEY',
    models: ['gemini-3.5-flash', 'gemini-2.5-flash', 'gemini-3.5-flash-lite'] },
  { name: 'NVIDIA NIM',  baseUrl: 'https://integrate.api.nvidia.com/v1', keyEnv: 'NVIDIA_API_KEY',
    models: ['nvidia/nemotron-3-super-120b-a12b', 'meta/llama-3.3-70b-instruct', 'openai/gpt-oss-120b'] },
  { name: 'Mistral AI',  baseUrl: 'https://api.mistral.ai/v1',        keyEnv: 'MISTRAL_API_KEY',
    models: ['mistral-medium-3-5', 'mistral-small-2603'] },
  { name: 'Cloudflare Workers AI', keyEnv: 'CLOUDFLARE_API_TOKEN', extraEnv: ['CLOUDFLARE_ACCOUNT_ID'],
    baseUrl: () => `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/v1`,
    models: ['@cf/meta/llama-3.3-70b-instruct-fp8-fast', '@cf/openai/gpt-oss-120b'] },
  { name: 'OpenRouter',  baseUrl: 'https://openrouter.ai/api/v1',     keyEnv: 'OPENROUTER_API_KEY',
    models: ['nvidia/nemotron-3-super-120b-a12b:free', 'google/gemma-4-31b-it:free', 'openai/gpt-oss-20b:free'] },
  { name: 'Ollama Cloud', baseUrl: 'https://ollama.com/v1',           keyEnv: 'OLLAMA_API_KEY',
    models: ['gpt-oss:120b', 'deepseek-v4-flash'] },
  { name: 'Z AI (Zhipu)', baseUrl: 'https://open.bigmodel.cn/api/paas/v4', keyEnv: 'ZHIPU_API_KEY',
    models: ['glm-4.7-flash', 'glm-4.5-flash'] },
  { name: 'Cohere',      baseUrl: 'https://api.cohere.ai/compatibility/v1', keyEnv: 'COHERE_API_KEY',
    models: ['command-a-03-2025', 'command-r7b-arabic-02-2025'] },
  { name: 'SiliconFlow', baseUrl: 'https://api.siliconflow.cn/v1',    keyEnv: 'SILICONFLOW_API_KEY',
    models: ['Qwen/Qwen3-8B'] },
  { name: 'ModelScope',  baseUrl: 'https://api-inference.modelscope.cn/v1', keyEnv: 'MODELSCOPE_API_KEY',
    models: ['Qwen/Qwen3.5-35B-A3B', 'Qwen/Qwen3.5-27B'] },
  { name: 'Hugging Face', baseUrl: 'https://router.huggingface.co/v1', keyEnv: 'HF_TOKEN',
    models: ['meta-llama/Llama-3.1-8B-Instruct', 'Qwen/Qwen2.5-7B-Instruct'] },
  { name: 'Aion Labs',   baseUrl: 'https://api.aionlabs.ai/v1',       keyEnv: 'AION_API_KEY',
    models: ['aion-labs/aion-3.0-mini'] },

  // No key needed: last-resort fallbacks that always work (low rate limits).
  // LLM7 accepts an optional token to raise its limits.
  { name: 'Kilo Code',   baseUrl: 'https://api.kilo.ai/api/gateway',  keyless: true,
    models: ['kilo-auto/free'] },
  { name: 'LLM7.io',     baseUrl: 'https://api.llm7.io/v1',           keyless: true, keyEnv: 'LLM7_API_KEY',
    models: ['gpt-oss:20b', 'mistral-Nemo-Instruct-2407'] },
  { name: 'OVHcloud',    baseUrl: 'https://oai.endpoints.kepler.ai.cloud.ovh.net/v1', keyless: true,
    models: ['gpt-oss-120b', 'Meta-Llama-3_3-70B-Instruct', 'Mistral-Small-3.2-24B-Instruct-2506'] },
];
