// Reuse the exact LangChain provider factory used by the real application.
import { createModel } from '../../../apps/agent/src/model.ts';

const model = createModel();
const reply = await model.invoke(
  process.argv[2] || 'What time is it in Tokyo right now?',
);
console.log(reply.content);
