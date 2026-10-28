import assert from 'node:assert/strict';
import { Client as RunClient } from '@langchain/langgraph-sdk';
import { Client } from '@langchain/langgraph-sdk/client';
import { StreamController } from '@langchain/langgraph-sdk/stream';

const apiUrl = process.env.SKEIN_DEMO_URL || 'http://127.0.0.1:2025';
const client = new Client({ apiUrl });
const runClient = new RunClient({ apiUrl });
const timeout = setTimeout(() => { console.error('Verification timed out'); process.exit(1); }, 30000);
const controllers = [];
try {
  for (const approved of [true, false]) {
    const controller = new StreamController({ assistantId: 'approval', client });
    controllers.push(controller);
    const deactivate = controller.activate();
    await controller.submit({ request: 'Tokyo flight — verification, simulated' });
    assert.equal(controller.rootStore.getSnapshot().interrupts.length, 1);
    const threadId = controller.rootStore.getSnapshot().threadId;
    assert.ok(threadId);
    await controller.respond(approved);
    const state = await runClient.threads.getState(threadId);
    assert.equal(state.values.approved, approved);
    assert.match(state.values.outcome, approved ? /^Approved/ : /^Rejected/);
    deactivate();
    console.log(`Current SDK thread transport: ${approved ? 'approve' : 'reject'} passed`);
  }
  const thread = await runClient.threads.create();
  const run = await runClient.runs.create(thread.thread_id, 'job', {
    input: { request: 'Background verification' }, afterSeconds: 2,
  });
  assert.ok(run.run_id);
  await runClient.runs.join(thread.thread_id, run.run_id);
  const state = await runClient.threads.getState(thread.thread_id);
  assert.equal(state.values.outcome, 'Completed simulated job: Background verification');
  console.log('Background admission and later completion: passed');
} finally {
  clearTimeout(timeout);
  await Promise.all(controllers.map((controller) => controller.dispose()));
}
