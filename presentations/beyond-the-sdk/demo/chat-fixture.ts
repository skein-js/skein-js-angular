// Browser compatibility fixture only. No LLM calls: never present as Gemini output.
import { AIMessage } from '@langchain/core/messages';
import { FakeStreamingChatModel } from '@langchain/core/utils/testing';
import { MessagesAnnotation, StateGraph } from '@langchain/langgraph';
import { ToolNode, toolsCondition } from '@langchain/langgraph/prebuilt';
import { getCurrentTime } from '../../../apps/agent/src/time.ts';

const failed = new Set<string>();
export const chat = new StateGraph(MessagesAnnotation)
  .addNode('agent', async (state) => {
    const last = state.messages.at(-1)!;
    if (last.type === 'human' && String(last.content).includes('fail-once') && !failed.has(last.id!)) {
      failed.add(last.id!);
      throw new Error('Fixture provider unavailable; retry this saved turn');
    }
    if (last.type === 'human' && /Tokyo|Nairobi/i.test(String(last.content))) {
      return { messages: [new AIMessage({
        content: '',
        tool_calls: [{ name: 'get_current_time', args: { timeZone: /Nairobi/i.test(String(last.content)) ? 'Africa/Nairobi' : 'Asia/Tokyo' }, id: crypto.randomUUID(), type: 'tool_call' }],
      })] };
    }
    const text = last.type === 'tool'
      ? `Fixture clock result: ${last.content}`
      : `Fixture response: ${state.messages.filter((message) => message.type === 'human').length} user turn(s). ${last.content}`;
    const model = new FakeStreamingChatModel({ responses: [new AIMessage(text)], sleep: 5 });
    return { messages: [await model.invoke(state.messages)] };
  })
  .addNode('tools', new ToolNode([getCurrentTime]))
  .addEdge('__start__', 'agent')
  .addConditionalEdges('agent', toolsCondition)
  .addEdge('tools', 'agent')
  .compile();
