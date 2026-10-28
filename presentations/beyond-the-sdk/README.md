# Beyond the SDK

Slidev presentation for **Build Agentic Application with LangGraph**, Builders Space,
28 October 2026. Maina Wycliffe, Founder Garatropic.

The 26-slide deck follows a team assistant from a Gemini call through a LangGraph tool loop
to a usable application served by Skein. The existing Angular app is the main demo.
The talk is planned for 60 minutes, including about 30 minutes of demonstrations
and source walkthroughs. The rest of the two-hour session is open for questions
and hands-on exploration; workshop slides have been removed as requested.

## Present

From this directory, with Node 24:

```sh
npm ci
npm run dev
```

Open http://localhost:3030. Presenter view: http://localhost:3030/presenter/.
Speaker notes contain timings, demo prompts and source links.

```sh
npm run build             # standalone website in dist/
npm run export            # PDF; needs Playwright Chromium installed
```

The presentation has its own package and lockfile. Use npm here; the application
workspace continues to use pnpm. No external font or image requests are required.
Diagrams are editable. Larger architecture and graph comparisons live in
`components/`; `setup/mermaid.ts` supplies the Mermaid theme.

## Published slides

[Open the deck on GitHub Pages](https://skein-js.github.io/skein-js-angular/).
The `Publish session slides` GitHub Actions workflow builds and deploys this
directory after changes land on `main`. It can also be run manually. The build
uses the Pages base path and a `404.html` fallback for direct slide links.
Only the static presentation is hosted; the Angular app and Skein backend still
run locally. Screenshots and the refund recording are bundled with the slides.

## Demo preparation

See [DEMO-RUNBOOK.md](./DEMO-RUNBOOK.md) for commands, prompts, expected behavior
and recovery options. See [SOURCES.md](./SOURCES.md) for provenance and version scope.

- The root application's README covers the real Angular + model demo.
- `npm run demo:sdk` reuses that app's LangChain model factory without a graph.
- `npm run demo:approval` starts the separate keyless teaching examples on port 2025.
- In a second terminal, `npm run demo:verify` checks SDK approval/resume and background work.
- `demo/chat-fixture.ts` is a deterministic browser compatibility fixture. It never
  calls Gemini; its responses are explicitly labeled “Fixture”.

Local memory drivers lose state when the backend exits. The desktop examples and
durable storage configurations are documented paths, not features added to the
Angular chat in this change.
