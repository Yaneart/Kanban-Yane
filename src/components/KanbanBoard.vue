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

  const column = board.value.columns[index]
  if (!column) return
  if (column.cards.length > 0) {
    if (!window.confirm(`Удалить колонку с ${column.cards.length} карточками?`)) return
  }
  board.value.columns.splice(index, 1)
}

function resetBoard() {
  if (!window.confirm('Сбросить доску? Все данные будут потеряны!')) return
  board.value = structuredClone(initialData)
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
    <div class="board-header">
      <input v-model="searchQuery" class="search-input" placeholder="Поиск карточек..." />
      <button class="reset-btn" @click="resetBoard">Сбросить доску</button>
    </div>
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
  background: linear-gradient(
    135deg,
    var(--bg-gradient-1),
    var(--bg-gradient-2),
    var(--bg-gradient-3)
  );
  padding: 20px;
}

.search-input {
  width: 300px;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  background: var(--bg-input-alt);
  color: var(--text-primary);
  outline: none;
}

.search-input::placeholder {
  color: var(--text-placeholder);
}

.search-input:focus {
  background: var(--bg-input-focus-strong);
  box-shadow: 0 0 0 2px var(--accent-soft);
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
  background: var(--bg-hover);
  border-radius: 12px;
  padding: 12px;
  flex-shrink: 0;
}

.add-column input {
  padding: 10px 12px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  background: var(--bg-input-solid);
  outline: none;
}

.add-column button {
  padding: 10px;
  background: var(--accent-soft);
  color: var(--text-primary);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background 0.2s;
}

.add-column button:hover {
  background: var(--accent-medium);
}

.board-header {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 20px;
}

.reset-btn {
  padding: 10px 16px;
  background: var(--danger);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: opacity 0.2s;
}

.reset-btn:hover {
  opacity: 0.8;
}
</style>
