<script setup lang="ts">
import type { Card } from '@/types'

defineProps<{
  card: Card
}>()
</script>

<template>
  <div class="kanban-card">
    <h4>{{ card.title }}</h4>
    <p>{{ card.description }}</p>
  </div>
</template>

<style scoped>
.kanban-card {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.kanban-card h4 {
  margin: 0 0 4px;
  font-size: 14px;
}

.kanban-card p {
  margin: 0;
  font-size: 12px;
  color: #666;
}
</style>
