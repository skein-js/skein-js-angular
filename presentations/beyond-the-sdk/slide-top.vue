<script setup lang="ts">
import { useSlideContext } from '@slidev/client';
const { $page, $slidev } = useSlideContext();
</script>

<template>
  <footer class="deck-footer" aria-label="Slide branding and page number">
    <span class="brand"><img src="/skein-knot-dark.svg" alt="" /> skein-js</span>
    <span class="presenter">Maina Wycliffe</span>
    <span>{{ $page }} / {{ $slidev.nav.total }}</span>
  </footer>
</template>

<style scoped>
.deck-footer { position:absolute;z-index:30;bottom:13px;left:58px;right:58px;display:flex;align-items:center;justify-content:space-between;color:#9eb1c7;font:14px ui-sans-serif,system-ui,sans-serif;pointer-events:none; }
.brand { display:flex;align-items:center;gap:8px;letter-spacing:.02em; }
.brand img { width:22px;height:22px; }
.presenter { position:absolute;left:50%;transform:translateX(-50%);white-space:nowrap; }
</style>
