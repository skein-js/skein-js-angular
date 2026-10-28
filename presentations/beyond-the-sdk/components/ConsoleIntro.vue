<template>
  <svg class="console-intro" viewBox="0 0 864 210" role="img" aria-labelledby="console-intro-title">
    <title id="console-intro-title">Questions to investigate a wrong answer: the conversation, model call, tool result, and saved state</title>
    <defs><marker id="console-intro-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#8cc2ff" /></marker></defs>
    <g class="step">
      <rect x="3" y="25" width="190" height="150" rx="6" />
      <text x="22" y="62" class="name">Thread</text>
      <text x="22" y="106">The right</text><text x="22" y="135">conversation?</text>
      <rect x="226" y="25" width="190" height="150" rx="6" />
      <text x="245" y="62" class="name">Model</text>
      <text x="245" y="106">Which tool</text><text x="245" y="135">and arguments?</text>
      <rect x="449" y="25" width="190" height="150" rx="6" />
      <text x="468" y="62" class="name">Tool result</text>
      <text x="468" y="106">What did the</text><text x="468" y="135">clock return?</text>
      <rect x="672" y="25" width="190" height="150" rx="6" />
      <text x="691" y="62" class="name">Checkpoint</text>
      <text x="691" y="106">What state</text><text x="691" y="135">did we save?</text>
    </g>
    <path class="edge" d="M196 100 H220" /><path class="edge" d="M419 100 H443" /><path class="edge" d="M642 100 H666" />
  </svg>
</template>
<style scoped>
.console-intro { display:block;width:100%;height:210px;margin-top:24px;font-family:ui-sans-serif,system-ui,sans-serif;letter-spacing:0; }
.step rect { fill:#10263d;stroke:#527ca9;stroke-width:1.5; }
.step text { fill:#bacee5;font-size:21px; }
.step .name { fill:#8cc2ff;font-size:24px;font-weight:600; }
.edge { stroke:#8cc2ff;stroke-width:2;fill:none;marker-end:url(#console-intro-arrow); }
</style>
