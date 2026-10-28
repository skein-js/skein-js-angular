<template>
  <svg class="tool-call-trace" viewBox="0 0 864 270" role="img" aria-labelledby="tool-trace-title tool-trace-description">
    <title id="tool-trace-title">One clock tool call, from request to answer</title>
    <desc id="tool-trace-description">Gemini requests get_current_time for Asia/Tokyo. The app validates the timezone and reads its clock. The tool returns a timestamp, and Gemini uses it in the final answer. The timestamp is illustrative.</desc>
    <defs><marker id="tool-trace-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#8cc2ff" /></marker></defs>
    <g class="step">
      <rect x="4" y="25" width="250" height="190" rx="6" />
      <text x="24" y="56" class="role">01 · GEMINI REQUESTS</text>
      <text x="24" y="91" class="heading">Call the clock tool</text>
      <text x="24" y="127" class="code">get_current_time({</text>
      <text x="24" y="154" class="code">  timeZone: 'Asia/Tokyo'</text>
      <text x="24" y="181" class="code">})</text>
    </g>
    <path class="edge" d="M258 120 H299" />
    <g class="step">
      <rect x="306" y="25" width="250" height="190" rx="6" />
      <text x="326" y="56" class="role">02 · YOUR APP EXECUTES</text>
      <text x="326" y="91" class="heading">Read the clock</text>
      <text x="326" y="128" class="detail">Validate the timezone</text>
      <text x="326" y="157" class="detail">Get the current time</text>
      <text x="326" y="186" class="code">→ Asia/Tokyo · 15:00 JST</text>
    </g>
    <path class="edge" d="M560 120 H601" />
    <g class="step">
      <rect x="608" y="25" width="250" height="190" rx="6" />
      <text x="628" y="56" class="role">03 · GEMINI ANSWERS</text>
      <text x="628" y="91" class="heading">Use the tool result</text>
      <text x="628" y="135" class="answer">“It’s 3:00 PM</text>
      <text x="628" y="167" class="answer">in Tokyo.”</text>
    </g>
    <text x="431" y="252" class="caption" text-anchor="middle">Illustrative timestamp · the live demo reads the actual clock</text>
  </svg>
</template>
<style scoped>
.tool-call-trace { display:block;width:100%;height:270px;margin-top:20px;font-family:ui-sans-serif,system-ui,sans-serif;letter-spacing:0; }
.step rect { fill:#10263d;stroke:#527ca9;stroke-width:1.5; }
.role { fill:#8cc2ff;font-size:14px;letter-spacing:.6px; }
.heading { fill:#eef2f6;font-size:22px;font-weight:600; }
.detail { fill:#c0d0e2;font-size:20px; }
.code { fill:#b9d9ff;font:15px ui-monospace,SFMono-Regular,Menlo,monospace; }
.answer { fill:#eef2f6;font-size:25px; }
.edge { fill:none;stroke:#8cc2ff;stroke-width:2;marker-end:url(#tool-trace-arrow); }
.caption { fill:#99b2ce;font-size:16px; }
</style>
