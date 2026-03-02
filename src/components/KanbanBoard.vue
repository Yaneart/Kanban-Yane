<script setup lang="ts">
import type { Board, Column } from '@/types'
import KanbanColumn from './KanbanColumn.vue'
import { initialData } from '@/data/initialData'
import draggable from 'vuedraggable'
import { ref } from 'vue'
import { useLocalStorage } from '@/composables/useLocalStorage'
import { provideHistory } from '@/composables/useHistory'

defineProps<{
  themeToggler: () => void
  theme: 'dark' | 'light'
}>()

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString()
}

const newColumnTitle = ref('')
const board = useLocalStorage<Board>('kanban-board', structuredClone(initialData))
const searchQuery = ref('')
const showHistory = ref(false)
const { history, addHistory } = provideHistory()

function addColumn() {
  const title = newColumnTitle.value.trim()
  if (!title) return
  const column: Column = {
    id: `column-${Date.now()}`,
    title,
    cards: [],
  }
  board.value.columns.push(column)
  addHistory(`Добавлена колонка "${title}"`)
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
  addHistory(`Удалена колонка "${column.title}"`)
  board.value.columns.splice(index, 1)
}

function resetBoard() {
  if (!window.confirm('Сбросить доску? Все данные будут потеряны!')) return
  addHistory('Доска сброшена')
  board.value = structuredClone(initialData)
}
</script>

<template>
  <div class="kanban-board">
    <!-- Header -->
    <header class="board-header">
      <h1 class="board-title">Kanban Board</h1>
      <input v-model="searchQuery" class="search-input" placeholder="Поиск карточек..." />
      <div class="header-actions">
        <button class="reset-btn" @click="resetBoard">Сбросить</button>
        <button class="history-toggle" @click="showHistory = !showHistory">История</button>
        <button class="theme-btn" @click="themeToggler">
          {{ theme === 'dark' ? '☀️' : '🌙' }}
        </button>
      </div>
    </header>

    <!-- Main content -->
    <div class="board-body">
      <div class="board-content">
        <draggable
          v-model="board.columns"
          group="column"
          item-key="id"
          class="column-list"
          :animation="200"
        >
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
          <button @click="addColumn">+ Добавить</button>
        </div>
      </div>

      <!-- Sidebar -->
      <Transition name="slide">
        <aside v-if="showHistory" class="history-panel">
          <div class="history-header">
            <h3>История</h3>
            <button class="close-history" @click="showHistory = false">&times;</button>
          </div>
          <ul>
            <li v-for="entry in history" :key="entry.id">
              <span class="history-action">{{ entry.action }}</span>
              <span class="history-time">{{ formatTime(entry.timestamp) }}</span>
            </li>
          </ul>
        </aside>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
/* ===== Layout ===== */
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
}

/* ===== Header ===== */
.board-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
}

.board-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
}

.search-input {
  flex: 1;
  max-width: 300px;
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
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

.header-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.reset-btn {
  padding: 8px 14px;
  background: var(--danger);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: opacity 0.2s;
}

.reset-btn:hover {
  opacity: 0.8;
}

.history-toggle {
  padding: 8px 14px;
  background: var(--accent-btn);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: background 0.2s;
}

.history-toggle:hover {
  background: var(--accent-btn-hover);
}

.theme-btn {
  padding: 8px 14px;
  background: var(--accent-btn);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.2s;
}

.theme-btn:hover {
  background: var(--accent-btn-hover);
}

/* ===== Body ===== */
.board-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.board-content {
  display: flex;
  gap: 16px;
  flex: 1;
  overflow-x: auto;
  padding: 20px;
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

/* ===== History Sidebar ===== */
.history-panel {
  width: 280px;
  min-width: 280px;
  background: var(--bg-column);
  padding: 16px;
  overflow-y: auto;
  border-left: 1px solid var(--bg-hover);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.history-header h3 {
  margin: 0;
  font-size: 14px;
  color: var(--text-primary);
}

.close-history {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}

.close-history:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}

.history-panel ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.history-panel li {
  padding: 8px 0;
  border-bottom: 1px solid var(--bg-hover);
}

.history-action {
  color: var(--text-primary);
  display: block;
  font-size: 12px;
}

.history-time {
  color: var(--text-secondary);
  font-size: 11px;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

/* ===== Mobile ===== */
@media (max-width: 768px) {
  .board-header {
    flex-wrap: wrap;
    gap: 10px;
  }

  .board-title {
    font-size: 18px;
  }

  .search-input {
    order: 1;
    flex: 1 1 100%;
    max-width: none;
  }

  .header-actions {
    margin-left: 0;
  }

  .board-content {
    padding: 12px;
    gap: 12px;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
  }

  .column-list {
    gap: 12px;
  }

  .board-content :deep(.kanban-column) {
    scroll-snap-align: start;
    min-width: 260px;
  }

  .history-panel {
    position: fixed;
    top: 0;
    right: 0;
    height: 100vh;
    z-index: 100;
    box-shadow: -4px 0 20px rgba(0, 0, 0, 0.4);
  }
}
</style>
