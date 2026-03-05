<script setup lang="ts">
import type { Board, Column } from '@/types'
import KanbanColumn from './KanbanColumn.vue'
import draggable from 'vuedraggable'
import { computed, ref } from 'vue'
import { provideHistory } from '@/composables/useHistory'
import { useThemeStore } from '@/stores/theme'
import { useToast } from '@/composables/useToast'

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

const backgrounds = [
  // Тёмные
  'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
  'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
  'linear-gradient(135deg, #2d1b69, #6b21a8, #9333ea)',
  'linear-gradient(135deg, #064e3b, #065f46, #047857)',
  'linear-gradient(135deg, #7f1d1d, #991b1b, #b91c1c)',
  'linear-gradient(135deg, #1a1033, #2d1b69, #4a2c8a)',
  // Светлые
  'linear-gradient(135deg, #e0c3fc, #8ec5fc, #f5f7fa)',
  'linear-gradient(135deg, #fbc2eb, #a6c1ee, #c2e9fb)',
  'linear-gradient(135deg, #a8edea, #fed6e3, #fefbd8)',
  'linear-gradient(135deg, #d4fc79, #96e6a1, #c2ffd8)',
  'linear-gradient(135deg, #ffecd2, #fcb69f, #ff9a9e)',
  'linear-gradient(135deg, #a1c4fd, #c2e9fb, #e8f0fe)',
  'linear-gradient(135deg, #f3e7e9, #e3eeff, #d4e4ff)',
  'linear-gradient(135deg, #fad0c4, #ffd1ff, #e8cff7)',
  // Однотонные
  '#1a1a2e',
  '#0f172a',
  '#1e293b',
  '#f0eaf5',
  '#e8e0f0',
  '#f5f7fa',
]

const boardStyle = computed(() => {
  const bg = props.board.background
  if (!bg) {
    return {
      background:
        'linear-gradient(135deg, var(--bg-gradient-1), var(--bg-gradient-2), var(--bg-gradient-3))',
    }
  }
  if (bg.startsWith('http')) {
    return { backgroundImage: `url(${bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }
  }
  return { background: bg }
})

function getHexBrightness(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (r * 299 + g * 587 + b * 114) / 1000
}

function setBackground(bg: string) {
  props.board.background = bg

  const hexMatch = bg.match(/#[0-9a-fA-F]{6}/)
  if (hexMatch) {
    const brightness = getHexBrightness(hexMatch[0])
    const shouldBeLight = brightness > 128
    if (
      (shouldBeLight && themeStore.theme === 'dark') ||
      (!shouldBeLight && themeStore.theme === 'light')
    ) {
      themeStore.toggleTheme()
    }
  }
}

function resetBackground() {
  props.board.background = undefined
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString()
}

function exportBoard() {
  const json = JSON.stringify(props.board, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'kanban-board.json'
  a.click()
  URL.revokeObjectURL(url)
  addToast('Доска экспортирована', 'success')
}

function importBoard() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = () => {
    const file = input.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string) as Board
        emit('update:board', data)
        addHistory('Доска импортирована')
        addToast('Доска импортирована', 'success')
      } catch {
        addToast('Ошибка импорта', 'error')
      }
    }
    reader.readAsText(file)
  }
  input.click()
}

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
      <RouterLink to="/" class="back-btn">← Назад</RouterLink>
      <h1 class="board-title">{{ board.title }}</h1>
      <input v-model="searchQuery" class="input search-input" placeholder="Поиск карточек..." />
      <div class="header-actions">
        <button class="btn btn-danger" @click="resetBoard">Сбросить</button>
        <button class="btn btn-primary" @click="showHistory = !showHistory">История</button>
        <button class="btn btn-primary" @click="showArchive = !showArchive">Архив</button>
        <button class="btn btn-primary" @click="showBgPicker = !showBgPicker">Фон</button>
        <button class="btn btn-primary" @click="themeStore.toggleTheme()">
          {{ themeStore.theme === 'dark' ? '☀️' : '🌙' }}
        </button>
        <button class="btn btn-primary" @click="exportBoard">Экспорт</button>
        <button class="btn btn-primary" @click="importBoard">Импорт</button>
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
  background: var(--bg-input-alt);
}

.search-input:focus {
  background: var(--bg-input-focus-strong);
}

.header-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
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

.back-btn {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
  padding: 8px 12px;
  border-radius: 6px;
  transition:
    background 0.2s,
    color 0.2s;
}

.back-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
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
