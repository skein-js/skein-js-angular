import { AIMessage, BaseMessage, HumanMessage } from '@langchain/core/messages';
import { MemorySaver } from '@langchain/langgraph';
import { describe, expect, it, vi } from 'vitest';
import { graph } from './agent-graph.js';

const { invoke } = vi.hoisted(() => ({ invoke: vi.fn() }));
vi.mock('./model.js', () => ({
  createModel: () => ({ bindTools: () => ({ invoke }) }),
}));

describe('chat graph retry', () => {
  it('replaces the saved user turn when a failed model call is retried', async () => {
    const agent = graph.builder.compile({ checkpointer: new MemorySaver() });
    const config = { configurable: { thread_id: 'retry-test' } };
    const message = new HumanMessage({ id: 'same-turn', content: 'Hello' });
    invoke
      .mockRejectedValueOnce(new Error('Provider offline'))
      .mockResolvedValueOnce(new AIMessage('Hello there'));

    await expect(agent.invoke({ messages: [message] }, config)).rejects.toThrow(
      'Provider offline',
    );
    const saved = await agent.getState(config);
    expect(
      saved.values.messages.map((item: BaseMessage) => item.content),
    ).toEqual(['Hello']);

    const result = await agent.invoke({ messages: [message] }, config);
    expect(result.messages.map((item) => item.content)).toEqual([
      'Hello',
      'Hello there',
    ]);
    expect(
      result.messages.filter((item) => item.type === 'human'),
    ).toHaveLength(1);
    await agent.invoke(null, config);
    expect(invoke).toHaveBeenCalledTimes(2);
  });
});
