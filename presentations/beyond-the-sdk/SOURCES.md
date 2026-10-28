# Sources and scope

Sources consulted on 28 October 2026. Each relevant slide also has source links in
presenter notes. Code excerpts are intentionally short; omitted setup is identified.

| Subject | Primary source |
| --- | --- |
| Event title, host, instructor and format | https://luma.com/hp7jn59h |
| Project purpose and motivation; aegra inspiration | https://skein-js.github.io/skein-js/why |
| Runtime overview | https://skein-js.github.io/skein-js/ |
| Supported features and known gaps | https://skein-js.github.io/skein-js/roadmap |
| Version-specific client evidence and differences | https://skein-js.github.io/skein-js/langgraph-compatibility |
| Console behavior and screenshot | https://skein-js.github.io/skein-js/console |
| Interrupt/checkpointer/resume semantics | https://skein-js.github.io/skein-js/human-in-the-loop |
| Background jobs, retries and durability limits | https://skein-js.github.io/skein-js/background-jobs |
| Callback delivery | https://skein-js.github.io/skein-js/webhooks |
| SQLite and process ownership | https://skein-js.github.io/skein-js/local-deployment |
| Electron application example | https://github.com/skein-js/skein-js/tree/main/examples/desktop-electron |
| Tauri application and Node backend | https://github.com/skein-js/skein-js/tree/main/examples/desktop-tauri |
| Local CLI example | https://github.com/skein-js/skein-js/tree/main/examples/local-cli |
| Existing-backend adapters | https://skein-js.github.io/skein-js/framework-adapters |
| LangGraph responsibilities and graph concepts | https://docs.langchain.com/oss/javascript/langgraph/overview and https://docs.langchain.com/oss/javascript/langgraph/graph-api |
| LangChain Google adapter | https://docs.langchain.com/oss/javascript/integrations/chat/google_generative_ai |
| React binding example | https://github.com/skein-js/skein-js/tree/main/examples/react-usestream |
| Chat UI example | https://github.com/skein-js/skein-js/tree/main/examples/chat-app |
| Refund approvals and recording | https://github.com/skein-js/skein-js/tree/main/examples/decoupled-delivery and https://github.com/skein-js/skein-js/blob/main/docs/videos/decoupled-refund-approval.mp4 |
| Background issue triage example | https://github.com/skein-js/skein-js/tree/main/examples/triage-agent |
| Release history | https://github.com/skein-js/skein-js/blob/main/CHANGELOG.md |
| Slidev syntax and export | https://sli.dev/guide/syntax and https://sli.dev/guide/exporting |

## Local application evidence

The conversation screenshot is a capture of this repository's Angular message list,
using `demo/chat-fixture.ts` and its real clock tool. Its responses are labeled
“Fixture”; it is not evidence of Gemini output. The console run and thread images
come from `docs/public/images/console/` in the upstream repository. They show a
research example, not the hypothetical Nairobi/Tokyo incident. The refund video is
the official upstream recording; email and WhatsApp providers in that example are
recording fakes. Its poster is an extracted video frame. Upstream examples may use
newer APIs than this deck's pinned local fixture.

- `../../apps/agent/src/model.ts`: actual provider factory and Google adapter.
- `../../apps/agent/src/time.ts`: validated timezone argument and live clock tool.
- `../../apps/agent/src/agent-graph.ts`: actual agent/tools cycle.
- `../../apps/web/src/app/chat.ts`: current Angular binding, thread selection and recovery.
- `../../apps/agent/project.json`: `--no-persist`, memory-only application runtime.
- `../../README.md`: application contract, setup and scope.

## Versions

The published releases checked for this task are Skein **0.23.0**, `@skein-js/nx`
**0.23.0**, `@langchain/angular` **1.2.8**, and SDK **1.12.8**. The application
manifests and lockfile record the installed versions. The presentation has a separate
npm lockfile, including its keyless example dependencies.

The Angular binding still advertises Angular 18–21 peer support while this app uses
Angular 22. Local checks do not turn that into an upstream support guarantee.
The project's published compatibility matrix records tests against other specific
SDK versions; our checks establish only the scenarios actually exercised here.

Skein is described as pre-alpha in its docs. Shared features such as threads,
streaming and approvals are not claimed as Skein inventions. Ordinary completion
webhooks also exist on LangGraph Platform. Skein documents idempotent run creation
and durable signed/retried/replayable delivery as extensions. Desktop helpers,
adapters and console are described as Skein deployment choices, not proof a
competitor could never implement those things. No current competitor price claims
are included.

## Visual provenance and identity

The logo files and console PNG come unchanged from `skein-js/skein-js`,
`docs/public/`, under the project's Apache-2.0 license. See
[ASSET-LICENSE.txt](./ASSET-LICENSE.txt). The console PNG is identified as an official
documentation screenshot on its slide. Editable Mermaid and native SVG diagrams describe the
cited code and documented boundaries; they are explanatory diagrams, not measured
execution traces.

Company name, website, LinkedIn `mainawycliffe`, and Twitter `_mainawycliffe` were
provided by the presenter. The motivation slide paraphrases the project's Why page;
no personal origin story is invented.

## Verification performed for this workspace

The Slidev production build completed. After the content cleanup, all 26 slides were rendered in Chromium,
checked for empty content, diagram parse errors and overflow, and inspected visually.
The Angular production build, service tests, agent tests, typecheck and lint passed.
Cancellation regression checks cover Stop during thread creation and retry state
loading. A production browser check confirmed that a cancelled create request
dispatches no run, and that a fresh submission still succeeds. The Pages subpath
build was checked for all slide images, direct slide links and video loading.
The Angular bundle exceeds the configured warning budget but stays below the error
budget. The SDK's Angular peer-range warning remains as described above.

Real HTTP checks with SDK 1.12.8 and Skein 0.23.0 passed approval, rejection and
background completion. Chromium exercised the actual built Angular app against the
explicitly labeled deterministic chat fixture: tool loop, follow-up turn, separate
conversation, returning to a thread, refresh restoration, saved-turn retry, history
reload after a temporary failure, and explicit server cancellation passed.
These checks do not establish live Gemini model quality or production durability.

The local environment's model name was corrected to `gemini-3.8-flash`, confirmed
by the authenticated model list. A short live generation request then returned
HTTP 402 (depleted prepayment credits), so a successful live Gemini generation
remains unverified until the configured project has available credits.

The added early LangGraph capability comparison was checked against the official
LangGraph overview and persistence guides and rendered separately. It distinguishes
the open-source library from the Agent Server / LangSmith Deployment product.
