<script setup lang="ts">
import KanbanBoard from './components/KanbanBoard.vue'
</script>

<template>
  <KanbanBoard />
</template>

<style>
:root {
  /* Градиент фона */
  --bg-gradient-1: #1a1033;
  --bg-gradient-2: #2d1b69;
  --bg-gradient-3: #4a2c8a;

  /* Фоны */
  --bg-column: #2a2040;
  --bg-card: #362b50;
  --bg-card-hover: #3d3260;

  /* Полупрозрачные фоны */
  --bg-hover: rgba(255, 255, 255, 0.08);
  --bg-input: rgba(255, 255, 255, 0.1);
  --bg-input-alt: rgba(255, 255, 255, 0.12);
  --bg-input-focus: rgba(255, 255, 255, 0.15);
  --bg-input-focus-strong: rgba(255, 255, 255, 0.2);
  --bg-input-solid: rgba(255, 255, 255, 0.9);

  /* Текст */
  --text-primary: #e8e0f0;
  --text-secondary: #9b8ab8;
  --text-muted: #ccc;
  --text-placeholder: rgba(255, 255, 255, 0.4);

  /* Акценты */
  --accent: #a882ff;
  --accent-btn: #7c5cbf;
  --accent-btn-hover: #9a6ef5;
  --accent-soft: rgba(168, 130, 255, 0.4);
  --accent-medium: rgba(168, 130, 255, 0.6);

  /* Приоритеты */
  --priority-low: #61bd4f;
  --priority-medium: #f2d600;
  --priority-high: #eb5a46;

  /* Danger */
  --danger: #eb5a46;
  --danger-bg: rgba(235, 90, 70, 0.1);

  /* Тени */
  --shadow: rgba(0, 0, 0, 0.3);
  --shadow-hover: rgba(0, 0, 0, 0.4);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
</style>
