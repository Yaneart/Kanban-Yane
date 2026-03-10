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
import BoardStats from './BoardStats.vue'

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
const showStats = ref(false)

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
  if (props.board.columns.length >= 10) {
    addToast('Максимум 10 колонок', 'error')
    return
  }
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

const columnsList = computed(() => props.board.columns.map((c) => ({ id: c.id, title: c.title })))

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

function updateColumn(updatedColumn: Column) {
  const index = props.board.columns.findIndex((c) => c.id === updatedColumn.id)
  if (index !== -1) {
    props.board.columns[index] = updatedColumn
  }
}

function togglePanel(panel: 'history' | 'archive' | 'stats') {
  if (panel === 'history') {
    showHistory.value = !showHistory.value
    showArchive.value = false
    showStats.value = false
  } else if (panel === 'archive') {
    showArchive.value = !showArchive.value
    showHistory.value = false
    showStats.value = false
  } else {
    showStats.value = !showStats.value
    showHistory.value = false
    showArchive.value = false
  }
}
</script>

<template>
  <div class="kanban-board" :style="boardStyle">
    <!-- шапка -->
    <header class="board-header">
      <RouterLink to="/" class="logo-link" title="На главную">
        <span class="logo-text">KANBAN</span>
      </RouterLink>
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
            Фон
          </button>
          <button
            class="action-btn"
            :class="{ active: showHistory }"
            title="История действий"
            @click="togglePanel('history')"
          >
            История
          </button>
          <button
            class="action-btn"
            :class="{ active: showArchive }"
            title="Архив карточек"
            @click="togglePanel('archive')"
          >
            Архив
          </button>
          <button
            class="action-btn"
            :class="{ active: showStats }"
            title="Статистика"
            @click="togglePanel('stats')"
          >
            Статистика
          </button>
        </div>

        <button class="action-btn theme-btn" title="Сменить тему" @click="themeStore.toggleTheme()">
          {{ themeStore.theme === 'dark' ? '☀' : '☾' }}
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

    <Transition name="bg-slide">
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
    </Transition>

    <!-- основной контент -->
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
              @update-column="updateColumn"
            />
          </template>
        </draggable>
        <div class="add-column">
          <input v-model="newColumnTitle" placeholder="Новая колонка..." @keyup.enter="addColumn" />
          <button @click="addColumn">+ Добавить</button>
        </div>
      </div>

      <!-- боковая панель -->
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
      <Transition name="slide">
        <aside v-if="showStats" class="history-panel">
          <div class="history-header">
            <h3>Статистика</h3>
            <button class="btn-icon" @click="showStats = false">✕</button>
          </div>
          <BoardStats :board="board" />
        </aside>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
/* разметка */
.kanban-board {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--bg-main);
  position: relative;
  overflow: hidden;
}

.kanban-board::before {
  content: '';
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 50% at 15% 35%, var(--aurora-1) 0%, transparent 55%),
    radial-gradient(ellipse 50% 40% at 85% 15%, var(--aurora-2) 0%, transparent 45%),
    radial-gradient(ellipse 60% 50% at 50% 85%, var(--aurora-3) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

/* шапка */
.board-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 28px;
  height: 56px;
  background: var(--header-bg);
  backdrop-filter: blur(40px);
  border-bottom: 1px solid var(--border-subtle);
  position: relative;
  z-index: 2;
}

.logo-link {
  text-decoration: none;
  flex-shrink: 0;
}

.logo-text {
  font-family: 'Syne', sans-serif;
  font-size: 18px;
  font-weight: 800;
  background: linear-gradient(135deg, #a78bfa, #60a5fa, #f472b6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-divider {
  width: 1px;
  height: 22px;
  background: var(--border-strong);
  flex-shrink: 0;
}

.board-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #888;
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
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 11px;
  pointer-events: none;
  opacity: 0.5;
}

.search-input {
  width: 100%;
  padding: 7px 16px 7px 32px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border-medium);
  border-radius: 10px;
  color: #888;
  font-size: 12px;
  font-family: 'Outfit', sans-serif;
  outline: none;
  transition: all 0.25s;
}

.search-input::placeholder {
  color: var(--text-secondary);
}

.search-input:focus {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(139, 92, 246, 0.3);
  box-shadow: 0 0 0 3px var(--accent-glow);
  color: var(--text-primary);
}

/* кнопки шапки */
.header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.btn-group {
  display: flex;
  background: rgba(255, 255, 255, 0.03);
  padding: 3px;
  border-radius: 10px;
  gap: 2px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  height: 32px;
  padding: 0 12px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 500;
  font-family: 'Outfit', sans-serif;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #999;
}

.action-btn.active {
  background: rgba(139, 92, 246, 0.2);
  color: #a78bfa;
}

.action-label {
  font-size: 12px;
  font-weight: 500;
}

.theme-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 8px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border-medium);
}

.theme-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: rotate(20deg);
}

/* выпадающее меню */
.dropdown-wrapper {
  position: relative;
}

.dropdown-wrapper > .action-btn {
  width: 32px;
  padding: 0;
  font-size: 16px;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border-medium);
  border-radius: 8px;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: var(--bg-column-solid);
  border: 1px solid var(--border-medium);
  border-radius: 12px;
  padding: 6px;
  min-width: 200px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.6);
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
  font-size: 12px;
  font-weight: 500;
  font-family: 'Outfit', sans-serif;
  cursor: pointer;
  transition: all 0.15s;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.04);
}

.dropdown-item.danger {
  color: var(--danger);
}

.dropdown-item.danger:hover {
  background: rgba(239, 68, 68, 0.08);
}

.dropdown-separator {
  height: 1px;
  background: var(--border-subtle);
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

/* тело доски */
.board-body {
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.board-content {
  display: flex;
  gap: 2px;
  flex: 1;
  overflow-x: auto;
  padding: 0;
  align-items: stretch;
}

.column-list {
  display: flex;
  gap: 2px;
  align-items: stretch;
  flex: 1;
}

.add-column {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 200px;
  max-width: 200px;
  background: transparent;
  padding: 20px 12px;
  flex-shrink: 0;
  opacity: 0.5;
  transition: opacity 0.3s;
}

.add-column:hover {
  opacity: 1;
}

.add-column input {
  padding: 8px 12px;
  border: 1px dashed rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  font-size: 12px;
  font-family: 'Outfit', sans-serif;
  background: transparent;
  color: var(--text-primary);
  outline: none;
  transition: all 0.2s;
}

.add-column input::placeholder {
  color: #2a2a35;
}

.add-column input:focus {
  border-color: rgba(139, 92, 246, 0.2);
  background: rgba(139, 92, 246, 0.03);
}

.add-column button {
  padding: 8px;
  background: rgba(139, 92, 246, 0.08);
  color: #666;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 600;
  font-family: 'Outfit', sans-serif;
  transition: all 0.2s;
}

.add-column button:hover {
  background: rgba(139, 92, 246, 0.15);
  color: #a78bfa;
}

/* панель истории */
.history-panel {
  position: fixed;
  top: 56px;
  right: 0;
  bottom: 0;
  width: 280px;
  background: var(--bg-column-solid);
  padding: 20px 16px;
  overflow-y: auto;
  border-left: 1px solid var(--border-subtle);
  scrollbar-width: none;
  z-index: 10;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.history-header h3 {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-secondary);
}

.history-panel ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.history-panel li {
  padding: 10px 0;
  border-bottom: 1px solid var(--border-subtle);
}

.history-action {
  color: #ccc;
  display: block;
  font-size: 12px;
}

.history-time {
  color: var(--text-muted);
  font-size: 10px;
}

.slide-enter-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-leave-active {
  transition: transform 0.2s ease-in;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

.bg-slide-enter-active {
  transition:
    transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.3s;
}

.bg-slide-leave-active {
  transition:
    transform 0.2s ease-in,
    opacity 0.2s;
}

.bg-slide-enter-from,
.bg-slide-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

.archive-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid var(--border-subtle);
}

.archive-card-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.archive-card-title {
  font-size: 13px;
  color: #ccc;
}

.archive-card-column {
  font-size: 10px;
  color: var(--text-muted);
}

.restore-btn {
  color: #a78bfa;
}

.bg-picker {
  position: fixed;
  top: 56px;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 28px;
  background: var(--bg-column-solid);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-subtle);
  flex-wrap: wrap;
  z-index: 10;
}

.bg-option {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.bg-option:hover {
  border-color: var(--accent);
  transform: scale(1.15);
}

.bg-url-input {
  max-width: 200px;
}

.board-content::-webkit-scrollbar {
  height: 4px;
}

.board-content::-webkit-scrollbar-track {
  background: transparent;
}

.board-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
}

.board-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.15);
}

.column-list :deep(.column-ghost) {
  opacity: 0.3;
}

.column-list :deep(.column-dragging) {
  opacity: 0.9;
  transform: rotate(1deg);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);
}

/* мобильная версия */
@media (max-width: 768px) {
  .board-header {
    flex-wrap: wrap;
    gap: 6px;
    padding: 8px 12px;
    height: auto;
  }

  .board-title {
    font-size: 13px;
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
    padding: 10px 12px 10px 32px;
    font-size: 16px;
  }

  .search-input:focus {
    max-width: none;
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
    padding: 0 8px;
    font-size: 14px;
  }

  /* скрытие текста кнопок на мобилке */

  .board-content {
    padding: 0;
    gap: 0;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
  }

  .column-list {
    gap: 0;
  }

  .board-content :deep(.kanban-column) {
    scroll-snap-align: start;
    min-width: 85vw;
    width: 85vw;
  }

  .board-content :deep(.column-drag-handle) {
    opacity: 0.5;
    font-size: 16px;
    padding: 8px;
  }

  .add-column {
    min-width: 85vw;
  }

  .history-panel {
    position: fixed;
    top: 0;
    right: 0;
    height: 100vh;
    width: 85vw;
    min-width: auto;
    z-index: 200;
    box-shadow: -4px 0 30px rgba(0, 0, 0, 0.5);
  }

  .logo-text {
    font-size: 15px;
  }

  .action-btn {
    height: 44px;
  }

  .theme-btn,
  .dropdown-wrapper > .action-btn {
    width: 44px;
    height: 44px;
  }
}
</style>
