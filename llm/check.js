// Tests every configured provider individually and prints which ones work.
import { chat, enabledProviders } from './router.js';

const all = enabledProviders();
console.log(`Checking ${all.length} provider(s)...\n`);
for (const p of all) {
  try {
    const out = await chat(
      { messages: [{ role: 'user', content: 'Reply with just the word OK.' }], max_tokens: 200 },
      { only: [p.name], log: () => {} });
    const text = (out.choices[0].message.content || '').trim().slice(0, 40);
    console.log(`  OK    ${p.name.padEnd(22)} ${out.model}  -> "${text}"`);
  } catch (e) {
    console.log(`  FAIL  ${p.name.padEnd(22)} ${e.message.split('\n').slice(1).join(' | ').slice(0, 200)}`);
  }
}
