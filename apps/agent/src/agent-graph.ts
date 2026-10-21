import { SystemMessage } from '@langchain/core/messages';
import { MessagesAnnotation, StateGraph } from '@langchain/langgraph';
import { ToolNode, toolsCondition } from '@langchain/langgraph/prebuilt';
import { createModel } from './model.js';
import { getCurrentTime } from './time.js';

const tools = [getCurrentTime];
const model = createModel().bindTools(tools);
const instructions = new SystemMessage(
  'You are a helpful, concise assistant. Use get_current_time when asked about ' +
    'the current time. Use conversation history for follow-up questions. ' +
    'Prefer plain text and short paragraphs unless the user asks for code.',
);

// LangGraph defines the model → tools → model loop.
// Skein CLI serves this graph and supplies its thread checkpointer and streaming.
export const graph = new StateGraph(MessagesAnnotation)
  .addNode('agent', async (state) => ({
    messages: [await model.invoke([instructions, ...state.messages])],
  }))
  .addNode('tools', new ToolNode(tools))
  .addEdge('__start__', 'agent')
  .addConditionalEdges('agent', toolsCondition)
  .addEdge('tools', 'agent')
  .compile();
