import { ChatAnthropic } from '@langchain/anthropic';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatOpenAI } from '@langchain/openai';

/** Changing the provider never changes the graph or the Angular client. */
export function createModel(env: NodeJS.ProcessEnv = process.env) {
  const model = env['MODEL_NAME']?.trim();
  if (!model)
    throw new Error(
      'Set MODEL_NAME in apps/agent/.env to a model you can access.',
    );

  function key(name: string) {
    const value = env[name]?.trim();
    if (!value) throw new Error('Set ' + name + ' in apps/agent/.env.');
    return value;
  }

  const options = { model, maxRetries: 1 };
  switch (env['MODEL_PROVIDER']) {
    case 'openai':
      return new ChatOpenAI({
        ...options,
        apiKey: key('OPENAI_API_KEY'),
        timeout: 30_000,
      });
    case 'anthropic':
      return new ChatAnthropic({
        ...options,
        apiKey: key('ANTHROPIC_API_KEY'),
        maxTokens: 2048,
      });
    case 'google':
      return new ChatGoogleGenerativeAI({
        ...options,
        apiKey: key('GOOGLE_API_KEY'),
      });
    default:
      throw new Error(
        'Set MODEL_PROVIDER to openai, anthropic, or google in apps/agent/.env.',
      );
  }
}
