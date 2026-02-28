<script setup lang="ts">
import type { Board, Column } from '@/types'
import KanbanColumn from './KanbanColumn.vue'
import { initialData } from '@/data/initialData'
import draggable from 'vuedraggable'
import { computed, ref, watch } from 'vue'

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

const newColumnTitle = ref('')
const board = ref<Board>(loadBoard())
const searchQuery = ref('')

function addColumn() {
  const title = newColumnTitle.value.trim()
  if (!title) return
  const column: Column = {
    id: `column-${Date.now()}`,
    title,
    cards: [],
  }
  board.value.columns.push(column)
  newColumnTitle.value = ''
}

function deleteColumn(id: string) {
  const index = board.value.columns.findIndex((e) => e.id === id)
  if (index === -1) return

  const columns = board.value.columns[index]
  if (!columns) return
  if (columns?.cards.length > 0) {
    if (!window.confirm(`Удалить колонку с ${columns?.cards.length} карточками?`)) return
  }
  board.value.columns.splice(index, 1)
}

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
    <input v-model="searchQuery" placeholder="Фильтр..." />
    <draggable v-model="board.columns" group="column" item-key="id" class="column-list">
      <template #item="{ element }">
        <KanbanColumn
          :key="element.id"
          :search-query="searchQuery"
          :column="element"
          @delete="deleteColumn"
        />
      </template>
    </draggable>
    <div class="add-column">
      <input v-model="newColumnTitle" placeholder="Новая колонка..." @keyup.enter="addColumn" />
      <button @click="addColumn">+</button>
    </div>
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

.column-list {
  display: flex;
  gap: 16px;
}
</style>
