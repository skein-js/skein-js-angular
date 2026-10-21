# Angular + Skein.js chat

A small chat app for a blog post: real model responses, token streaming, separate
conversations, and one tool that tells the current time. Application state lives in memory.
Angular lives in `apps/web`; the Skein agent lives in `apps/agent`.

## Run it

Use Node 24 or 26 and pnpm 9.15 (pinned in package.json).

1. Run `pnpm install`.
2. Copy `apps/agent/.env.example` to `apps/agent/.env`.
3. Set `MODEL_PROVIDER`, `MODEL_NAME`, and your selected provider's API key.
4. Run `pnpm dev`, then open **http://localhost:4200**.

Choose a model available in your account that supports tool calling:

| MODEL_PROVIDER | Required key      |
| -------------- | ----------------- |
| openai         | OPENAI_API_KEY    |
| anthropic      | ANTHROPIC_API_KEY |
| google         | GOOGLE_API_KEY    |

For example, replace both placeholders in this configuration:

```dotenv
MODEL_PROVIDER=openai
MODEL_NAME=your-model-id
OPENAI_API_KEY=your-api-key
```

Keys stay in the agent's ignored `.env` file and never go into Angular.
There is no keyless fallback. The agent reports a configuration error until a real
provider is configured. Saving `.env` reloads the graph.

Try “What time is it in Tokyo?”, then “And in Nairobi?” to see a tool call and a
follow-up using conversation history. Tool results can be expanded in the chat.
Use New chat to start an independent conversation.

## How it works

```text
Angular -> @langchain/angular -> Skein CLI -> LangGraph -> model + time tool
        <-           server-sent events (SSE)           <-
```

- `apps/agent/langgraph.json` registers the exported graph as **chat**.
- `apps/agent/src/agent-graph.ts` defines the LangGraph model/tool loop.
- `apps/agent/src/model.ts` selects the provider from environment variables.
- `apps/web/src/app/chat.ts` uses `injectStream` from `@langchain/angular` for messages,
  streaming, thread history, loading, errors, and cancellation.
- The page, message list, and composer render those signals. The composer uses
  Angular Signal Forms.

The Angular side has three standalone components and one chat service. The page
provides the service, so leaving the page also stops its stream. Components read
signals and emit events; the service owns updates to conversation state. The
message list derives display text with `computed` and tracks messages by ID.
Angular 22 already defaults to
[OnPush change detection](https://angular.dev/best-practices/skipping-subtrees).
These choices follow the
[Angular style guide](https://angular.dev/style-guide) and keep the example small.

The core Angular integration is:

```ts
readonly stream = injectStream({
  apiUrl: inject(DOCUMENT).location.origin + '/agent',
  assistantId: 'chat',
  fetchStateHistory: false,
});
```

For each message, Angular sends **only the new turn**. Skein loads the thread's
checkpointed history. `injectStream` assembles streamed messages and exposes
Angular signals; the UI renders `stream.messages()`, including tool results.

Stop aborts the stream, with `onDisconnect: 'cancel'` asking Skein to cancel the run.
Retry checks whether the original message was checkpointed. Saved turns resume
with null input; unsaved turns are resubmitted with the same message ID. The UI
also reuses the optimistic message instead of appending another copy.
A failed history load retries the selected conversation; a failed sidebar load
retries the conversation list.

Angular's dev server proxies `/agent` to the CLI on port 2024. The browser uses the
same origin without a custom backend server. Messages are rendered as plain text.

`@langchain/angular` is pinned to **0.4.8**, which uses the Agent Protocol run
endpoints supported by Skein 0.21. Its newer 1.x releases use a different transport.
The package declares Angular 18–21 peer support; this workspace uses Angular 22,
so builds and browser behavior are checked locally.

## In memory means in memory

The generated Nx dev target runs `skein dev --port 2024 --no-persist`.
Threads, checkpoints, and the run queue use memory; dev snapshots are disabled.
Restarting the agent clears conversations. Refreshing the browser can reload
threads while the agent is still running. There is no database, Redis, or browser storage.

This example runs locally. Authentication and deployment are outside its scope.

## Commands

```sh
pnpm dev                          # Angular and Skein together
pnpm exec nx dev apps-agent        # Skein only (http://localhost:2024)
pnpm exec nx serve skein-js-angular # Angular only
pnpm build                        # Angular production build + Skein artifact
pnpm typecheck
pnpm test
pnpm lint
```

Retry tests exercise the real SDK controller and LangGraph checkpointing, with
fake HTTP and model responses. The application always uses a real provider;
a live model check requires your own credentials.

The agent project was scaffolded with the Skein Nx generator:

```sh
pnpm exec nx g @skein-js/nx:application --directory=apps/agent --storage=memory --provider=openai
```

The generated sample was replaced with the configurable chat agent.
The CLI and generated Nx targets handle the agent lifecycle.

## Troubleshooting

- **Connection error:** check that `pnpm dev` started both processes and port 2024
  is available. Click Retry after the backend starts.
- **Graph/configuration error:** check the agent terminal and `.env`. Set a valid
  model ID and the key matching your selected provider.
- **No tool call:** ask explicitly for the current time and choose a model that
  supports tool calling.
- **Conversations disappeared:** restarting Skein intentionally resets memory.
