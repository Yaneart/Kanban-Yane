<script setup lang="ts">
import type { Board, Column } from '@/types'
import KanbanColumn from './KanbanColumn.vue'
import { initialData } from '@/data/initialData'
import draggable from 'vuedraggable'
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
    <input v-model="searchQuery" class="search-input" placeholder="Поиск карточек..." />
    <div class="board-content">
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
        <button @click="addColumn">+ Добавить колонку</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.kanban-board {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1033, #2d1b69, #4a2c8a);
  padding: 20px;
}

.search-input {
  width: 300px;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.12);
  color: #e8e0f0;
  margin-bottom: 20px;
  outline: none;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.search-input:focus {
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 0 2px rgba(168, 130, 255, 0.4);
}

.board-content {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  flex: 1;
  align-items: flex-start;
}

.column-list {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.add-column {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 280px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 12px;
  flex-shrink: 0;
}

.add-column input {
  padding: 10px 12px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.9);
  outline: none;
}

.add-column button {
  padding: 10px;
  background: rgba(168, 130, 255, 0.4);
  color: #e8e0f0;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background 0.2s;
}

.add-column button:hover {
  background: rgba(168, 130, 255, 0.6);
}
</style>
