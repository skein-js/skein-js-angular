# Presenter runbook

## Prepare before the session

1. At repository root: `pnpm install`.
2. Configure `apps/agent/.env` using `.env.example`. For Gemini use
   `MODEL_PROVIDER=google`, `MODEL_NAME=<a tool-capable Gemini model available to you>`,
   and `GOOGLE_API_KEY=<your key>`. Do not project the environment file.
3. At root: `pnpm dev`. Open http://localhost:4200 and http://localhost:2024/console.
4. In this presentation directory: `npm ci`, then `npm run dev`.
5. In another terminal here: `npm run demo:approval`. Open http://localhost:2025/console.
6. In a further terminal here: `npm run demo:verify`.
7. If Gemini reports depleted prepayment credits, restore the configured project’s
   credits in AI Studio before the live demo. Model-name correction alone does not
   resolve a 402 billing error.
8. Rehearse one real Gemini response and one clock tool call using your account.
   The API key, model availability and provider behavior cannot be proved by keyless checks.

Ports: app 4200; its backend 2024; keyless examples 2025; Slidev 3030.
Do not point the real app at a deterministic fixture and call its output Gemini.

## First hour

| Time | Show | What the audience should see |
| --- | --- | --- |
| 00–04 | The user's task and session map | A Nairobi team coordinating with Tokyo |
| 04–10 | LangChain model call; `npm run demo:sdk` | One provider call, no clock tool or graph |
| 10–17 | Tool schema, graph, graph vocabulary | Nodes are steps; directed edges route; a cycle repeats |
| 17–21 | Serving boundary and Why SkeinJS | Product needs around a working graph |
| 21–29 | Angular chat screenshot; optional app walkthrough | Tool results, follow-up context, separate conversations |
| 29–32 | Angular/React code; state diagram | Same API, framework-specific reactivity; thread vs run |
| 32–38 | Three-part console story | User report → run activity → thread state and checkpoints |
| 38–44 | Approval code and official refund recording | Saved pause; decisions across channels; fake providers |
| 44–48 | Background-work diagram and documented SDK recipe | Accepted now; result delivered later; linked triage example |
| 48–53 | Desktop/server and storage diagrams | SQLite local owner vs shared Postgres/Redis deployment |
| 53–60 | Responsibilities, choices, questions | What the product must still decide |

The main deck uses screenshots and a bundled recording for chat, approvals and
background work. The local demo instructions below remain optional rehearsal and
verification material. The recording's upstream example may use newer APIs than
the pinned local fixture; its email and WhatsApp clients are recording fakes.

## Demo 1: one call

From this directory, with the root agent's Google environment configured:

```sh
npm run demo:sdk
```

Show `demo/sdk-call.mjs`, then the Google branch of `apps/agent/src/model.ts`.
This is the same LangChain provider adapter as the app. Do not promise the model
will get the time wrong: its output varies. Ask what evidence shows a clock was used.

## Demo 2: tool loop

Show `apps/agent/src/time.ts` and `apps/agent/src/agent-graph.ts`.
In the Angular app ask:

> Use the time tool to tell me the current time in Tokyo.

Expand the actual tool result. Explain model proposal → application tool execution
→ result in state → model answer. If no call occurred, say so and use the explicit
prompt again; never narrate an event that was not observed.

## Demo 3: useful conversation

1. “What time is it in Tokyo?”
2. “And in Nairobi?”
3. New chat: a different question.
4. Select the first conversation and inspect its history.
5. Refresh, then select it again while the agent process stays alive.
6. Start a longer answer and click Stop. The current SDK explicitly requests server cancellation.

The app has no database and no user authentication. Different threads are separate
conversations, not a demonstration of access control between users. Restarting the
backend clears all chats. Error/retry is best demonstrated with a rehearsed provider
failure; the verification fixture provides a deterministic `fail-once` case separately.

## Demo 4: inspect the runtime

Open the live console on 2024. Find the actual thread from Demo 3. Show messages,
one run, state and saved checkpoints where exposed. The bundled console image is
an official docs screenshot, not a recording of your demo. Avoid claiming retained
activity proves which node is currently executing.

## Demo 5: ask a person first

In the separate console on 2025 choose `approval`, select JSON input, and submit:

```json
{ "request": "Book the Tokyo flight — simulated" }
```

Observe the interruption. Refresh or leave and reopen the same thread without
stopping the backend. Respond with literal JSON `true`. Inspect the approved result.
In a **new** thread, repeat and respond with `false` to see rejection.

This example makes no booking and calls no model. LangGraph provides interrupt();
Skein supplies checkpoint integration, serving and console controls. A resume starts
a new run on the same thread. The node runs again on resume: real side effects need
careful placement and deduplication.

## Demo 6: leave while work continues

On 2025 choose `job`, select JSON input and submit:

```json
{ "request": "Prepare the Tokyo trip summary" }
```

Set a 10-second delay under advanced run options. Submit, then navigate away from
the page (do not click Stop run). Return to the thread after the delay and inspect
`outcome`. This is a simulated task, not an LLM-produced summary.

The server stays running. This does not prove recovery after a crash. Background
queue storage and checkpoint storage have separate durability contracts.

## If something fails

- Model/network unavailable: show LangChain and graph source; use keyless examples
  for approvals/background behavior. Label the missing real-model observation.
- Keyless console controls differ: use `npm run demo:verify` to exercise actual SDK
  requests and inspect the resulting threads in the console.
- Preview unavailable: `npm run build` produces a static deck. Rehearse the PDF
  export in advance if you want a further backup.
- Time is short: keep the existing chat plus console; compress the optional approval
  and job demos into one verified walkthrough. Keep the closing contact slide.

## Remaining session time

Answer questions, help people run the local app, or explore one official desktop
example. There are no workshop/reference slides after the closing slide.
