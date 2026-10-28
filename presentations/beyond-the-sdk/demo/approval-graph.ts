import { Annotation, StateGraph, interrupt } from '@langchain/langgraph';

// A deterministic teaching fixture. No model, network request, or real booking.
const State = Annotation.Root({
  request: Annotation<string>(),
  approved: Annotation<boolean>(),
  outcome: Annotation<string>(),
});

export const graph = new StateGraph(State)
  .addNode('review', (state) => {
    const approved = interrupt({
      question: 'Approve this simulated booking?',
      request: state.request,
      simulated: true,
    });
    // Nodes restart when resumed: keep side effects after the approval boundary.
    return { approved: approved === true };
  })
  .addNode('finish', (state) => ({
    outcome: state.approved
      ? 'Approved — simulated booking recorded. No real transaction.'
      : 'Rejected — no booking was made.',
  }))
  .addEdge('__start__', 'review')
  .addEdge('review', 'finish')
  .addEdge('finish', '__end__')
  .compile();

export const job = new StateGraph(State)
  .addNode('prepare', async (state) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return { outcome: `Completed simulated job: ${state.request}` };
  })
  .addEdge('__start__', 'prepare')
  .addEdge('prepare', '__end__')
  .compile();
