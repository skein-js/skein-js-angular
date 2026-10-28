<template>
  <svg class="approval-flow" viewBox="0 0 370 350" role="img" aria-labelledby="approval-flow-title">
    <title id="approval-flow-title">Interrupt saves a checkpoint, waits for a person, and resumes with an approval or rejection</title>
    <defs><marker id="approval-flow-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#8cc2ff" /></marker></defs>
    <g class="node">
      <rect x="65" y="3" width="240" height="55" rx="5" /><text x="185" y="38">interrupt(...)</text>
      <rect x="65" y="94" width="240" height="85" rx="5" /><text x="185" y="126">Save checkpoint</text><text x="185" y="154" class="small">Request + graph state</text>
      <rect x="65" y="215" width="240" height="55" rx="5" /><text x="185" y="250">Wait for a person</text>
    </g>
    <path class="edge" d="M185 60 V87" /><path class="edge" d="M185 181 V208" />
    <path class="edge" d="M140 272 V298 H85 V312" /><path class="edge" d="M230 272 V298 H285 V312" />
    <text x="113" y="294" class="decision" text-anchor="end">true</text><text x="257" y="294" class="decision" text-anchor="start">false</text>
    <g class="outcome">
      <rect x="3" y="319" width="164" height="29" rx="4" /><text x="85" y="340">Approved</text>
      <rect x="203" y="319" width="164" height="29" rx="4" /><text x="285" y="340">Rejected</text>
    </g>
  </svg>
</template>
<style scoped>
.approval-flow { display:block;width:100%;height:320px;font-family:ui-sans-serif,system-ui,sans-serif;letter-spacing:0; }
.node rect,.outcome rect { fill:#10263d;stroke:#527ca9;stroke-width:1.5; }
.node text { fill:#eef2f6;font-size:23px;text-anchor:middle;font-weight:550; }
.node .small { fill:#b6cce4;font-size:18px;font-weight:400; }
.edge { fill:none;stroke:#8cc2ff;stroke-width:2;marker-end:url(#approval-flow-arrow); }
.decision { fill:#8cc2ff;font:16px ui-monospace,SFMono-Regular,Menlo,monospace; }
.outcome text { fill:#e7f1ff;font-size:19px;text-anchor:middle; }
</style>
