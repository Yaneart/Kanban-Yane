<script setup lang="ts">
import type { Board } from '@/types'
import KanbanColumn from './KanbanColumn.vue'
import { initialData } from '@/data/initialData'
import { ref } from 'vue'

const board = ref<Board>(initialData)
</script>

<template>
  <div class="kanban-board">
    <KanbanColumn v-for="column in board.columns" :key="column.id" :column="column" />
  </div>
</template>

<style scoped>
.kanban-board {
  display: flex;
  gap: 16px;
  padding: 20px;
  overflow-x: auto;
  min-height: 100vh;
  background: #e2e8f0;
}
</style>
