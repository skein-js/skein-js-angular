<template>
  <svg class="architecture-diagram" viewBox="0 0 864 370" role="img" aria-labelledby="architecture-title architecture-description">
    <title id="architecture-title">Four layers of the Angular and Skein application</title>
    <desc id="architecture-description">Angular exchanges HTTP requests and streamed responses with Skein. Skein runs the LangGraph workflow. The workflow calls Gemini and executes the application's clock tool.</desc>
    <defs>
      <marker id="architecture-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#8cc2ff" /></marker>
    </defs>
    <rect x="480" y="7" width="378" height="356" rx="8" fill="#0b1928" stroke="#355574" />
    <text x="498" y="31" class="boundary">Your backend</text>
    <g class="layer">
      <rect x="14" y="51" width="304" height="112" />
      <text x="34" y="77" class="role">01 · USER INTERFACE</text>
      <text x="34" y="112" class="name">Angular</text>
      <text x="34" y="143" class="detail">Messages · Stop · Retry</text>
    </g>
    <g class="layer">
      <rect x="498" y="51" width="342" height="112" />
      <text x="518" y="77" class="role">02 · RUNTIME</text>
      <text x="518" y="112" class="name">SkeinJS</text>
      <text x="518" y="143" class="detail">API · runs · streaming · storage</text>
    </g>
    <g class="layer">
      <rect x="498" y="239" width="342" height="108" />
      <text x="518" y="265" class="role">03 · WORKFLOW</text>
      <text x="518" y="300" class="name">LangGraph.js</text>
      <text x="518" y="330" class="detail">State · routing · clock tool</text>
    </g>
    <g class="layer">
      <rect x="14" y="239" width="304" height="108" />
      <text x="34" y="265" class="role">04 · MODEL</text>
      <text x="34" y="300" class="name">Gemini</text>
      <text x="34" y="330" class="detail">Responses · tool requests</text>
    </g>
    <g class="connection">
      <path d="M324 108 H490" />
      <text x="406" y="86" text-anchor="middle">HTTP requests</text>
      <text x="406" y="139" text-anchor="middle">SSE responses</text>
      <path d="M670 169 V232" />
      <text x="689" y="206">Runs + events</text>
      <path d="M324 293 H490" />
      <text x="406" y="270" text-anchor="middle">Model calls</text>
      <text x="406" y="324" text-anchor="middle">Responses</text>
    </g>
  </svg>
</template>
<style scoped>
.architecture-diagram { display:block; width:100%; height:auto; margin-top:12px; font-family:ui-sans-serif,system-ui,sans-serif; letter-spacing:0; }
.layer rect { fill:#10263d; stroke:#527ca9; stroke-width:1.5; rx:5; }
.boundary { fill:#99b6d6; font-size:17px; }
.role { fill:#8cc2ff; font-size:15px; letter-spacing:1.3px; }
.name { fill:#eef2f6; font-size:31px; font-weight:600; }
.detail { fill:#c0d0e2; font-size:19px; }
.connection path { fill:none; stroke:#8cc2ff; stroke-width:2; marker-start:url(#architecture-arrow); marker-end:url(#architecture-arrow); }
.connection text { fill:#b6cee9; font-size:17px; }
</style>
