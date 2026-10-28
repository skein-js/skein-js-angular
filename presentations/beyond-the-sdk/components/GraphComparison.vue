<template>
  <svg class="graph-comparison" viewBox="0 0 864 330" role="img" aria-labelledby="comparison-title comparison-description">
    <title id="comparison-title">A one-way pipeline and a directed cycle</title>
    <desc id="comparison-description">Draft, review, and send form an acyclic pipeline. The agent and tools form a directed cycle, with an exit when no tool is requested.</desc>
    <defs><marker id="comparison-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#8cc2ff" /></marker></defs>
    <line x1="420" y1="12" x2="420" y2="320" stroke="#263d56" />
    <text x="195" y="37" class="heading" text-anchor="middle">One-way pipeline</text>
    <text x="195" y="68" class="caption" text-anchor="middle">Directed and acyclic</text>
    <g class="node">
      <rect x="20" y="143" width="100" height="68" /><text x="70" y="185">Draft</text>
      <rect x="150" y="143" width="100" height="68" /><text x="200" y="185">Review</text>
      <rect x="280" y="143" width="100" height="68" /><text x="330" y="185">Send</text>
    </g>
    <path class="edge" d="M121 177 H145" /><path class="edge" d="M251 177 H275" />
    <text x="200" y="282" class="caption" text-anchor="middle">Each step moves forward</text>
    <text x="646" y="37" class="heading" text-anchor="middle">Our chat loop</text>
    <text x="646" y="68" class="caption" text-anchor="middle">Directed and cyclic</text>
    <g class="node">
      <rect x="455" y="133" width="150" height="68" /><text x="530" y="175">agent</text>
      <rect x="690" y="133" width="150" height="68" /><text x="765" y="175">tools</text>
      <rect x="455" y="256" width="150" height="58" /><text x="530" y="293">END</text>
    </g>
    <path class="edge" d="M606 155 H684" /><text x="647" y="122" class="caption" text-anchor="middle">Tool requested</text>
    <path class="edge" d="M765 203 V231 H530 V205" /><text x="648" y="259" class="caption" text-anchor="middle">Tool result</text>
    <path class="edge" d="M476 203 V250" /><text x="492" y="244" class="caption" text-anchor="start">No tool call</text>
  </svg>
</template>
<style scoped>
.graph-comparison { display:block;width:100%;height:310px;margin-top:12px;font-family:ui-sans-serif,system-ui,sans-serif;letter-spacing:0; }
.heading { fill:#eef2f6;font-size:26px;font-weight:600; }
.caption { fill:#a9c5e5;font-size:18px; }
.node rect { fill:#10263d;stroke:#527ca9;stroke-width:1.5;rx:5; }
.node text { fill:#eef2f6;font-size:24px;text-anchor:middle; }
.edge { stroke:#8cc2ff;stroke-width:2;fill:none;marker-end:url(#comparison-arrow); }
</style>
