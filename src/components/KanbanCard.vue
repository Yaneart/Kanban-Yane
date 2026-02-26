<script setup lang="ts">
import type { Card } from '@/types'

defineProps<{
  card: Card
}>()

const emit = defineEmits<{
  delete: [id: string]
}>()
</script>

<template>
  <div class="kanban-card">
    <button class="delete-btn" @click="emit('delete', card.id)">x</button>
    <h4>{{ card.title }}</h4>
    <p>{{ card.description }}</p>
  </div>
</template>

<style scoped>
.kanban-card {
  position: relative;
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

.delete-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  background: none;
  border: none;
  font-size: 18px;
  color: #999;
  cursor: pointer;
  padding: 0 4px;
}

.delete-btn:hover {
  color: #e74c3c;
}
</style>
