<script setup lang="ts">
import ToastContainer from './components/ToastContainer.vue'
import { provideToast } from './composables/useToast'
import { useThemeStore } from './stores/theme'

useThemeStore()
provideToast()
</script>

<template>
  <ToastContainer />
  <RouterView />
</template>

<style>
:root {
  --bg-main: #06060c;
  --bg-gradient-1: #06060c;
  --bg-gradient-2: #0a0a14;
  --bg-gradient-3: #0e0e1a;

  --bg-column: rgba(255, 255, 255, 0.012);
  --bg-column-solid: #0d0d16;
  --bg-card: rgba(255, 255, 255, 0.025);
  --bg-card-hover: rgba(255, 255, 255, 0.04);

  --bg-hover: rgba(255, 255, 255, 0.04);
  --bg-input: rgba(255, 255, 255, 0.04);
  --bg-input-alt: rgba(255, 255, 255, 0.06);
  --bg-input-focus: rgba(255, 255, 255, 0.08);
  --bg-input-focus-strong: rgba(255, 255, 255, 0.12);
  --bg-input-solid: rgba(255, 255, 255, 0.9);

  --border-subtle: rgba(255, 255, 255, 0.04);
  --border-medium: rgba(255, 255, 255, 0.06);
  --border-strong: rgba(255, 255, 255, 0.08);

  --text-primary: #e0e0e0;
  --text-secondary: #555;
  --text-muted: #333;
  --text-placeholder: rgba(255, 255, 255, 0.25);

  --accent: #8b5cf6;
  --accent-btn: #8b5cf6;
  --accent-btn-hover: #7c3aed;
  --accent-soft: rgba(139, 92, 246, 0.2);
  --accent-medium: rgba(139, 92, 246, 0.35);
  --accent-glow: rgba(139, 92, 246, 0.06);

  --color-blue: #3b82f6;
  --color-pink: #ec4899;
  --color-green: #10b981;
  --color-purple: #8b5cf6;

  --priority-low: #22c55e;
  --priority-medium: #f59e0b;
  --priority-high: #ef4444;

  --danger: #ef4444;
  --danger-bg: rgba(239, 68, 68, 0.1);

  --shadow: rgba(0, 0, 0, 0.4);
  --shadow-hover: rgba(0, 0, 0, 0.6);

  --aurora-1: rgba(124, 58, 237, 0.12);
  --aurora-2: rgba(59, 130, 246, 0.08);
  --aurora-3: rgba(236, 72, 153, 0.06);
  --header-bg: rgba(6, 6, 12, 0.7);
  --card-title: #ddd;
  --card-desc: #4a4a5a;

  --modal-bg: #0d0d16;
  --modal-overlay: rgba(6, 6, 12, 0.7);
  --modal-text: #e0e0e0;
  --modal-text-sub: #999;
  --modal-text-muted: #555;
  --modal-text-dim: #333;
  --modal-text-body: #bbb;
  --modal-heading: #eee;
  --modal-card-bg: rgba(255, 255, 255, 0.025);
  --modal-card-border: rgba(255, 255, 255, 0.04);
  --modal-scrollbar: rgba(255, 255, 255, 0.08);
  --modal-grab: rgba(255, 255, 255, 0.1);
}

[data-theme='light'] {
  --bg-main: #e8eaef;
  --bg-gradient-1: #dfe2e8;
  --bg-gradient-2: #d5d9e0;
  --bg-gradient-3: #ccd0d9;

  --bg-column: rgba(255, 255, 255, 0.4);
  --bg-column-solid: #e2e5ec;
  --bg-card: rgba(255, 255, 255, 0.55);
  --bg-card-hover: rgba(255, 255, 255, 0.75);

  --bg-hover: rgba(0, 0, 0, 0.05);
  --bg-input: rgba(0, 0, 0, 0.06);
  --bg-input-alt: rgba(0, 0, 0, 0.08);
  --bg-input-focus: rgba(0, 0, 0, 0.08);
  --bg-input-focus-strong: rgba(0, 0, 0, 0.12);
  --bg-input-solid: #f0f1f5;

  --border-subtle: rgba(100, 116, 139, 0.12);
  --border-medium: rgba(100, 116, 139, 0.18);
  --border-strong: rgba(100, 116, 139, 0.25);

  --text-primary: #1a1a2e;
  --text-secondary: #4a5568;
  --text-muted: #818a9a;
  --text-placeholder: rgba(0, 0, 0, 0.32);

  --accent: #7c3aed;
  --accent-btn: #7c3aed;
  --accent-btn-hover: #6d28d9;
  --accent-soft: rgba(124, 58, 237, 0.1);
  --accent-medium: rgba(124, 58, 237, 0.18);
  --accent-glow: rgba(124, 58, 237, 0.06);

  --shadow: rgba(0, 0, 0, 0.08);
  --shadow-hover: rgba(0, 0, 0, 0.14);

  --aurora-1: rgba(100, 116, 139, 0.06);
  --aurora-2: rgba(59, 130, 246, 0.05);
  --aurora-3: rgba(124, 58, 237, 0.04);
  --header-bg: rgba(232, 234, 239, 0.88);
  --card-title: #1e293b;
  --card-desc: #5a6577;

  --modal-bg: #ffffff;
  --modal-overlay: rgba(0, 0, 0, 0.3);
  --modal-text: #1a1a2e;
  --modal-text-sub: #555;
  --modal-text-muted: #888;
  --modal-text-dim: #aaa;
  --modal-text-body: #444;
  --modal-heading: #1a1a2e;
  --modal-card-bg: rgba(0, 0, 0, 0.03);
  --modal-card-border: rgba(0, 0, 0, 0.06);
  --modal-scrollbar: rgba(0, 0, 0, 0.1);
  --modal-grab: rgba(0, 0, 0, 0.1);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: 'Outfit', sans-serif;
  background: var(--bg-main);
}
</style>
