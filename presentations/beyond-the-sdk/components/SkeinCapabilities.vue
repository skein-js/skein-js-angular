<template>
  <svg class="skein-capabilities" viewBox="0 0 864 320" role="img" aria-labelledby="skein-capabilities-title">
    <title id="skein-capabilities-title">Skein runtime capabilities: local apps, embedding, idempotent runs, completion delivery, console and channels</title>
    <defs><marker id="skein-capabilities-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#8cc2ff" /></marker></defs>
    <rect x="5" y="109" width="177" height="100" rx="7" class="root" />
    <text x="94" y="151" class="root-name">SkeinJS</text><text x="94" y="181" class="root-detail">runtime</text>
    <path class="spine" d="M184 159 H213 M213 31 V287" />
    <path class="edge" d="M213 31 H234" /><path class="edge" d="M213 95 H234" /><path class="edge" d="M213 159 H234" /><path class="edge" d="M213 223 H234" /><path class="edge" d="M213 287 H234" />
    <g class="feature">
      <rect x="240" y="4" width="618" height="54" rx="4" />
      <text x="258" y="38" class="name">Desktop + CLI</text><text x="500" y="38" class="detail">SQLite · one local owner</text>
      <rect x="240" y="68" width="618" height="54" rx="4" />
      <text x="258" y="102" class="name">Embed in a backend</text><text x="500" y="91" class="detail">Express · Fastify · NestJS</text><text x="500" y="113" class="detail">Next.js · Fetch</text>
      <rect x="240" y="132" width="618" height="54" rx="4" />
      <text x="258" y="166" class="name">Safer retries</text><text x="500" y="166" class="detail">Same idempotency key → one run</text>
      <rect x="240" y="196" width="618" height="54" rx="4" />
      <text x="258" y="230" class="name">Completion delivery</text><text x="500" y="230" class="detail">Save · sign · retry · replay</text>
      <rect x="240" y="260" width="618" height="54" rx="4" />
      <text x="258" y="294" class="name">Console + channels</text><text x="500" y="294" class="detail">Inspect runs · connect services</text>
    </g>
  </svg>
</template>
<style scoped>
.skein-capabilities { display:block;width:100%;height:320px;margin-top:18px;font-family:ui-sans-serif,system-ui,sans-serif;letter-spacing:0; }
.root { fill:#14314d;stroke:#6c9ac9;stroke-width:1.5; }
.root-name { fill:#eef2f6;font-size:30px;font-weight:600;text-anchor:middle; }
.root-detail { fill:#b9d2ed;font-size:20px;text-anchor:middle; }
.spine,.edge { fill:none;stroke:#8cc2ff;stroke-width:2; }
.edge { marker-end:url(#skein-capabilities-arrow); }
.feature rect { fill:#10263d;stroke:#355574;stroke-width:1.3; }
.name { fill:#e7f1ff;font-size:21px;font-weight:550; }
.detail { fill:#b5cee8;font-size:18px; }
</style>
