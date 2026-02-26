<script setup lang="ts">
import type { Column } from '@/types'
import KanbanCard from './KanbanCard.vue'

defineProps<{
  column: Column
}>()
</script>

<template>
  <div class="kanban-column">
    <h3>{{ column.title }}</h3>
    <div class="cards-list">
      <KanbanCard v-for="card in column.cards" :key="card.id" :card="card" />
    </div>
  </div>
</template>

<style scoped>
.kanban-column {
  background: #f0f0f0;
  border-radius: 8px;
  padding: 12px;
  width: 280px;
  min-height: 300px;
  flex-shrink: 0;
}

.kanban-column h3 {
  margin: 0 0 12px;
  font-size: 16px;
}
</style>
