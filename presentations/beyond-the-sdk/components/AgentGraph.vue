<template>
  <svg class="agent-graph" viewBox="0 0 300 365" role="img" aria-labelledby="agent-graph-title">
    <title id="agent-graph-title">Start calls agent, which either calls tools and loops back or exits</title>
    <defs><marker id="agent-graph-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#8cc2ff" /></marker></defs>
    <g class="node">
      <rect x="88" y="4" width="124" height="45" rx="22" /><text x="150" y="34">START</text>
      <rect x="70" y="91" width="160" height="65" rx="5" /><text x="150" y="131">agent</text>
      <rect x="70" y="224" width="160" height="65" rx="5" /><text x="150" y="264">tools</text>
      <rect x="88" y="317" width="124" height="45" rx="22" /><text x="150" y="347">END</text>
    </g>
    <path class="edge" d="M150 50 V84" />
    <path class="edge" d="M150 158 V216" />
    <text x="165" y="192" class="label">Tool call</text>
    <path class="edge" d="M68 257 H23 V124 H62" />
    <text class="label" transform="translate(16 233) rotate(-90)">Tool result</text>
    <path class="edge" d="M232 124 H279 V340 H220" />
    <text class="label" transform="translate(247 169) rotate(90)">No tool call</text>
  </svg>
</template>
<style scoped>
.agent-graph { display:block;width:100%;height:365px;font-family:ui-sans-serif,system-ui,sans-serif;letter-spacing:0; }
.node rect { fill:#10263d;stroke:#527ca9;stroke-width:1.5; }
.node text { fill:#eef2f6;font-size:24px;font-weight:550;text-anchor:middle; }
.edge { fill:none;stroke:#8cc2ff;stroke-width:2;marker-end:url(#agent-graph-arrow); }
.label { fill:#acc8e9;font-size:16px; }
</style>
