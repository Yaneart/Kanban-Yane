<script setup lang="ts">
import type { Board } from '@/types'
import KanbanColumn from './KanbanColumn.vue'
import { initialData } from '@/data/initialData'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'kanban-board'

function loadBoard(): Board {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      return JSON.parse(saved) as Board
    } catch (error) {
      console.log(error)
    }
  }
  return structuredClone(initialData)
}

const board = ref<Board>(loadBoard())

watch(
  board,
  (value) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  },
  { deep: true },
)
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
