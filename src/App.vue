<script setup lang="ts">
import { useThemeStore } from './stores/theme'

useThemeStore()
</script>

<template>
  <RouterView />
</template>

<style>
:root {
  --bg-gradient-1: #1a1033;
  --bg-gradient-2: #2d1b69;
  --bg-gradient-3: #4a2c8a;

  --bg-column: #2a2040;
  --bg-card: #362b50;
  --bg-card-hover: #3d3260;

  --bg-hover: rgba(255, 255, 255, 0.08);
  --bg-input: rgba(255, 255, 255, 0.1);
  --bg-input-alt: rgba(255, 255, 255, 0.12);
  --bg-input-focus: rgba(255, 255, 255, 0.15);
  --bg-input-focus-strong: rgba(255, 255, 255, 0.2);
  --bg-input-solid: rgba(255, 255, 255, 0.9);

  --text-primary: #e8e0f0;
  --text-secondary: #9b8ab8;
  --text-muted: #ccc;
  --text-placeholder: rgba(255, 255, 255, 0.4);

  --accent: #a882ff;
  --accent-btn: #7c5cbf;
  --accent-btn-hover: #9a6ef5;
  --accent-soft: rgba(168, 130, 255, 0.4);
  --accent-medium: rgba(168, 130, 255, 0.6);

  --priority-low: #61bd4f;
  --priority-medium: #f2d600;
  --priority-high: #eb5a46;

  --danger: #eb5a46;
  --danger-bg: rgba(235, 90, 70, 0.1);

  --shadow: rgba(0, 0, 0, 0.3);
  --shadow-hover: rgba(0, 0, 0, 0.4);
}

[data-theme='light'] {
  --bg-gradient-1: #e8e0f0;
  --bg-gradient-2: #d4c5e8;
  --bg-gradient-3: #c0a8e0;

  --bg-column: #f5f0fa;
  --bg-card: #ffffff;
  --bg-card-hover: #f0eaf5;

  --bg-hover: rgba(0, 0, 0, 0.06);
  --bg-input: rgba(0, 0, 0, 0.06);
  --bg-input-alt: rgba(0, 0, 0, 0.08);
  --bg-input-focus: rgba(0, 0, 0, 0.1);
  --bg-input-focus-strong: rgba(0, 0, 0, 0.12);
  --bg-input-solid: #ffffff;

  --text-primary: #2d1b4e;
  --text-secondary: #6b5a85;
  --text-muted: #555;
  --text-placeholder: rgba(0, 0, 0, 0.4);

  --accent: #7c5cbf;
  --accent-btn: #7c5cbf;
  --accent-btn-hover: #6a4aad;
  --accent-soft: rgba(124, 92, 191, 0.2);
  --accent-medium: rgba(124, 92, 191, 0.35);

  --shadow: rgba(0, 0, 0, 0.1);
  --shadow-hover: rgba(0, 0, 0, 0.15);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
</style>
