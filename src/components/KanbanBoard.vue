<script setup lang="ts">
import type { Board, Column } from '@/types'
import KanbanColumn from './KanbanColumn.vue'
import draggable from 'vuedraggable'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { provideHistory } from '@/composables/useHistory'
import { useThemeStore } from '@/stores/theme'
import { useToast } from '@/composables/useToast'
import { formatTime } from '@/utils/format'
import { useBackground } from '@/composables/useBackground'
import { useBoardActions } from '@/composables/useBoardActions'

const props = defineProps<{
  board: Board
}>()

const emit = defineEmits<{
  'update:board': [board: Board]
}>()

const newColumnTitle = ref('')
const searchQuery = ref('')
const showHistory = ref(false)
const { history, addHistory } = provideHistory()
const themeStore = useThemeStore()
const showArchive = ref(false)
const { addToast } = useToast()
const showBgPicker = ref(false)
const showMenu = ref(false)
const { backgrounds, boardStyle, setBackground, resetBackground } = useBackground(props.board)
const { exportBoard, importBoard } = useBoardActions(props.board, emit, addHistory)

function onClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.dropdown-wrapper')) {
    showMenu.value = false
  }
}

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))

function addColumn() {
  const title = newColumnTitle.value.trim()
  if (!title) return
  const column: Column = {
    id: crypto.randomUUID(),
    title,
    cards: [],
  }
  props.board.columns.push(column)
  addHistory(`Добавлена колонка "${title}"`)
  addToast('Колонка добавлена', 'success')
  newColumnTitle.value = ''
}

function deleteColumn(id: string) {
  const index = props.board.columns.findIndex((e) => e.id === id)
  if (index === -1) return

  const column = props.board.columns[index]
  if (!column) return
  if (column.cards.length > 0) {
    if (!window.confirm(`Удалить колонку с ${column.cards.length} карточками?`)) return
  }
  addHistory(`Удалена колонка "${column.title}"`)
  addToast('Колонка удалена', 'success')
  props.board.columns.splice(index, 1)
}

function resetBoard() {
  if (!window.confirm('Сбросить доску? Все данные будут потеряны!')) return
  addHistory('Доска сброшена')
  addToast('Доска сброшена', 'success')
  emit('update:board', { ...props.board, columns: [] })
}

function handleExport() {
  exportBoard()
  showMenu.value = false
}

function handleImport() {
  importBoard()
  showMenu.value = false
}

function handleReset() {
  resetBoard()
  showMenu.value = false
}

const archivedCards = computed(() => {
  return props.board.columns.flatMap((col) =>
    col.cards
      .filter((card) => card.archived)
      .map((card) => ({
        ...card,
        columnTitle: col.title,
        columnId: col.id,
      })),
  )
})

const columnsList = computed(() =>
  props.board.columns.map((c) => ({ id: c.id, title: c.title })),
)

function moveCard(cardId: string, sourceColumnId: string, targetColumnId: string) {
  const sourceCol = props.board.columns.find((c) => c.id === sourceColumnId)
  const targetCol = props.board.columns.find((c) => c.id === targetColumnId)
  if (!sourceCol || !targetCol) return

  const cardIndex = sourceCol.cards.findIndex((c) => c.id === cardId)
  if (cardIndex === -1) return

  const [card] = sourceCol.cards.splice(cardIndex, 1)
  if (!card) return
  targetCol.cards.push(card)
}

function restoreCard(columnId: string, cardId: string) {
  const column = props.board.columns.find((c) => c.id === columnId)
  if (!column) return

  const card = column.cards.find((c) => c.id === cardId)
  if (!card) return

  card.archived = false
  addHistory(`Восстановлена карточка "${card.title}"`)
  addToast('Карточка восстановлена', 'success')
}
</script>

<template>
  <div class="kanban-board" :style="boardStyle">
    <!-- Header -->
    <header class="board-header">
      <RouterLink to="/" class="back-btn" title="На главную">←</RouterLink>
      <div class="header-divider"></div>
      <h1 class="board-title">{{ board.title }}</h1>

      <div class="header-center">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input v-model="searchQuery" class="search-input" placeholder="Поиск..." />
        </div>
      </div>

      <div class="header-actions">
        <div class="btn-group">
          <button
            class="action-btn"
            :class="{ active: showBgPicker }"
            title="Фон доски"
            @click="showBgPicker = !showBgPicker"
          >
            🎨 <span class="action-label">Фон</span>
          </button>
          <button
            class="action-btn"
            :class="{ active: showHistory }"
            title="История действий"
            @click="showHistory = !showHistory"
          >
            📋 <span class="action-label">История</span>
          </button>
          <button
            class="action-btn"
            :class="{ active: showArchive }"
            title="Архив карточек"
            @click="showArchive = !showArchive"
          >
            📦 <span class="action-label">Архив</span>
          </button>
        </div>

        <button class="action-btn theme-btn" title="Сменить тему" @click="themeStore.toggleTheme()">
          {{ themeStore.theme === 'dark' ? '☀️' : '🌙' }}
        </button>

        <div class="dropdown-wrapper">
          <button
            class="action-btn"
            :class="{ active: showMenu }"
            title="Дополнительно"
            @click="showMenu = !showMenu"
          >
            ⋮
          </button>
          <Transition name="fade">
            <div v-if="showMenu" class="dropdown-menu">
              <button class="dropdown-item" @click="handleExport">
                <span>📥</span> Экспорт доски
              </button>
              <button class="dropdown-item" @click="handleImport">
                <span>📤</span> Импорт доски
              </button>
              <div class="dropdown-separator"></div>
              <button class="dropdown-item danger" @click="handleReset">
                <span>🗑️</span> Сбросить доску
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </header>

    <div v-if="showBgPicker" class="bg-picker">
      <div
        v-for="bg in backgrounds"
        :key="bg"
        class="bg-option"
        :style="{ background: bg }"
        @click="setBackground(bg)"
      ></div>
      <input
        class="input bg-url-input"
        placeholder="URL картинки..."
        @keyup.enter="setBackground(($event.target as HTMLInputElement).value)"
      />
      <button class="btn btn-ghost btn-sm" @click="resetBackground">Сброс</button>
    </div>

    <!-- Main content -->
    <div class="board-body">
      <div class="board-content">
        <draggable
          :list="board.columns"
          group="column"
          item-key="id"
          class="column-list"
          ghost-class="column-ghost"
          drag-class="column-dragging"
          handle=".column-drag-handle"
          :animation="200"
          :delay="100"
          :delay-on-touch-only="true"
        >
          <template #item="{ element }">
            <KanbanColumn
              :key="element.id"
              :search-query="searchQuery"
              :column="element"
              :all-columns="columnsList"
              @delete="deleteColumn"
              @move="moveCard"
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
            <button class="btn-icon" @click="showHistory = false">✕</button>
          </div>
          <ul>
            <li v-for="entry in history" :key="entry.id">
              <span class="history-action">{{ entry.action }}</span>
              <span class="history-time">{{ formatTime(entry.timestamp) }}</span>
            </li>
          </ul>
        </aside>
      </Transition>
      <Transition name="slide">
        <aside v-if="showArchive" class="history-panel">
          <div class="history-header">
            <h3>Архив</h3>
            <button class="btn-icon" @click="showArchive = false">✕</button>
          </div>
          <p v-if="!archivedCards.length" style="color: var(--text-secondary); font-size: 13px">
            Пусто
          </p>
          <div v-for="card in archivedCards" :key="card.id" class="archive-item">
            <div class="archive-card-info">
              <span class="archive-card-title">{{ card.title }}</span>
              <span class="archive-card-column">{{ card.columnTitle }}</span>
            </div>
            <button class="btn-icon restore-btn" @click="restoreCard(card.columnId, card.id)">
              ↩
            </button>
          </div>
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
}

/* ===== Header ===== */
.board-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 16px;
  transition:
    background 0.2s,
    color 0.2s;
  flex-shrink: 0;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.header-divider {
  width: 1px;
  height: 22px;
  background: rgba(255, 255, 255, 0.12);
  flex-shrink: 0;
}

.board-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
  flex-shrink: 0;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
  min-width: 0;
}

.search-wrapper {
  position: relative;
  width: 100%;
  max-width: 240px;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  pointer-events: none;
  opacity: 0.6;
}

.search-input {
  width: 100%;
  padding: 7px 12px 7px 30px;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 13px;
  outline: none;
  transition: all 0.25s;
}

.search-input::placeholder {
  color: var(--text-secondary);
  font-size: 13px;
}

.search-input:focus {
  background: rgba(255, 255, 255, 0.12);
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.12);
  max-width: 300px;
}

/* ===== Header Actions ===== */
.header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.btn-group {
  display: flex;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 3px;
  gap: 2px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  height: 32px;
  padding: 0 10px;
  background: none;
  border: none;
  border-radius: 7px;
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.action-btn.active {
  background: var(--accent);
  color: #fff;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.35);
}

.action-label {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.theme-btn {
  width: 34px;
  height: 34px;
  padding: 0;
  border-radius: 8px;
  font-size: 16px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.theme-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: rotate(20deg);
}

/* ===== Dropdown ===== */
.dropdown-wrapper {
  position: relative;
}

.dropdown-wrapper > .action-btn {
  width: 34px;
  padding: 0;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 1px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: var(--bg-column);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 6px;
  min-width: 200px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
  z-index: 100;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 14px;
  background: none;
  border: none;
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.dropdown-item.danger {
  color: var(--danger);
}

.dropdown-item.danger:hover {
  background: rgba(239, 68, 68, 0.12);
}

.dropdown-separator {
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin: 4px 8px;
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.15s,
    transform 0.15s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
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

.archive-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--bg-hover);
}

.archive-card-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.archive-card-title {
  font-size: 13px;
  color: var(--text-primary);
}

.archive-card-column {
  font-size: 11px;
  color: var(--text-secondary);
}

.restore-btn {
  color: var(--accent);
}

.bg-picker {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  flex-wrap: wrap;
}

.bg-option {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  border: 2px solid transparent;
  transition:
    border-color 0.2s,
    transform 0.2s;
}

.bg-option:hover {
  border-color: var(--accent);
  transform: scale(1.1);
}

.bg-url-input {
  max-width: 200px;
}

.column-list :deep(.column-ghost) {
  opacity: 0.3;
}

.column-list :deep(.column-dragging) {
  opacity: 0.9;
  transform: rotate(2deg);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
}

/* ===== Mobile ===== */
@media (max-width: 768px) {
  .board-header {
    flex-wrap: wrap;
    gap: 6px;
    padding: 8px 10px;
  }

  .back-btn {
    width: 32px;
    height: 32px;
  }

  .board-title {
    font-size: 14px;
    white-space: normal;
    flex: 0 1 auto;
    max-width: 120px;
    line-height: 1.2;
  }

  .header-center {
    order: 1;
    flex: 1 1 100%;
  }

  .search-wrapper {
    max-width: none;
  }

  .search-input {
    padding: 10px 12px 10px 30px;
    font-size: 16px;
  }

  .header-divider {
    display: none;
  }

  .header-actions {
    gap: 4px;
  }

  .btn-group {
    padding: 2px;
    gap: 1px;
  }

  .action-btn {
    height: 34px;
    padding: 0 8px;
    font-size: 15px;
  }

  .action-label {
    display: none;
  }

  .theme-btn,
  .dropdown-wrapper > .action-btn {
    width: 34px;
    height: 34px;
  }

  .board-content {
    padding: 12px 8px;
    gap: 10px;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
  }

  .column-list {
    gap: 10px;
  }

  .board-content :deep(.kanban-column) {
    scroll-snap-align: start;
    min-width: 82vw;
    width: 82vw;
  }

  .board-content :deep(.column-drag-handle) {
    opacity: 0.5;
    font-size: 16px;
    padding: 8px;
  }

  .add-column {
    min-width: 82vw;
  }

  .history-panel {
    position: fixed;
    top: 0;
    right: 0;
    height: 100vh;
    width: 85vw;
    min-width: auto;
    z-index: 100;
    box-shadow: -4px 0 20px rgba(0, 0, 0, 0.4);
  }
}
</style>
