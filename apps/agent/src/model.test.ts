import { describe, expect, it } from 'vitest';
import { createModel } from './model.js';

describe('model configuration', () => {
  it.each([
    ['openai', 'OPENAI_API_KEY'],
    ['anthropic', 'ANTHROPIC_API_KEY'],
    ['google', 'GOOGLE_API_KEY'],
  ])('creates the %s adapter without making a request', (provider, key) => {
    expect(
      createModel({
        MODEL_PROVIDER: provider,
        MODEL_NAME: 'test-model',
        [key]: 'test-key',
      }),
    ).toBeDefined();
    expect(() =>
      createModel({
        MODEL_PROVIDER: provider,
        MODEL_NAME: 'test-model',
      }),
    ).toThrow(key);
  });

  it('requires an explicit model and supported provider', () => {
    expect(() => createModel({})).toThrow('MODEL_NAME');
    expect(() =>
      createModel({ MODEL_NAME: 'test', MODEL_PROVIDER: 'other' }),
    ).toThrow('MODEL_PROVIDER');
  });
});
