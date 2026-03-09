<script setup lang="ts">
import { useToast } from '@/composables/useToast'
import { useThemeStore } from '@/stores/theme'
import type { Board } from '@/types'
import { computed, ref } from 'vue'
import { useBoardsStore } from '@/stores/boards'

const boardsStore = useBoardsStore()
const newTitle = ref('')
const themeStore = useThemeStore()
const { addToast } = useToast()

const boardStats = computed(() => {
  return boardsStore.boards
    .map((board) => {
      const totalCards = board.columns.reduce(
        (sum, col) => sum + col.cards.filter((c) => !c.archived).length,
        0,
      )
      return {
        ...board,
        columnCount: board.columns.length,
        cardCount: totalCards,
      }
    })
    .sort((a, b) => Number(b.favorite) - Number(a.favorite))
})

function createBoard() {
  const title = newTitle.value.trim()
  if (!title) return

  const newBoard: Board = {
    id: crypto.randomUUID().slice(0, 8),
    title,
    columns: [],
  }

  boardsStore.addBoard(newBoard)
  addToast('Доска создана', 'success')
  newTitle.value = ''
}

function deleteBoard(id: string) {
  if (!window.confirm('Удалить доску?')) return
  boardsStore.deleteBoard(id)
  addToast('Доска удалена', 'success')
}
</script>

<template>
  <div class="home">
    <header class="home-header">
      <div class="header-left">
        <div class="logo"><span class="logo-accent">Y</span>ane</div>
        <span class="logo-dot"></span>
        <span class="logo-sub">kanban</span>
      </div>
      <button class="theme-toggle" title="Сменить тему" @click="themeStore.toggleTheme()">
        {{ themeStore.theme === 'dark' ? '☀️' : '🌙' }}
      </button>
    </header>

    <main class="home-content">
      <div class="welcome-section">
        <h1>Мои доски</h1>
        <p class="welcome-sub">
          {{ boardStats.length }}
          {{ boardStats.length === 1 ? 'доска' : boardStats.length < 5 ? 'доски' : 'досок' }}
        </p>
      </div>

      <div class="boards-grid">
        <RouterLink
          v-for="board in boardStats"
          :key="board.id"
          :to="'/board/' + board.id"
          class="board-card"
        >
          <button class="board-delete" @click.prevent="deleteBoard(board.id)">✕</button>
          <button
            class="board-favorite"
            :class="{ active: board.favorite }"
            @click.prevent="boardsStore.toggleFavorite(board.id)"
          >
            {{ board.favorite ? '★' : '☆' }}
          </button>
          <div class="board-card-content">
            <h3 class="board-name">{{ board.title }}</h3>
            <div class="board-stats">
              <span class="stat">
                <span class="stat-value">{{ board.columnCount }}</span>
                <span class="stat-label">{{
                  board.columnCount === 1 ? 'колонка' : 'колонок'
                }}</span>
              </span>
              <span class="stat-dot"></span>
              <span class="stat">
                <span class="stat-value">{{ board.cardCount }}</span>
                <span class="stat-label">{{
                  board.cardCount === 1 ? 'карточка' : 'карточек'
                }}</span>
              </span>
            </div>
          </div>
          <div class="board-card-bar"></div>
        </RouterLink>

        <div class="board-card create-card">
          <div class="create-icon">+</div>
          <input
            v-model="newTitle"
            class="create-input"
            placeholder="Название новой доски..."
            @keyup.enter="createBoard"
          />
          <button class="create-btn" @click="createBoard">Создать доску</button>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.home {
  min-height: 100vh;
  background: var(--bg-main);
  position: relative;
  overflow: hidden;
}

.home::before {
  content: '';
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 50% at 20% 30%, var(--aurora-1) 0%, transparent 55%),
    radial-gradient(ellipse 50% 40% at 80% 70%, var(--aurora-2) 0%, transparent 45%),
    radial-gradient(ellipse 60% 50% at 50% 10%, var(--aurora-3) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

/* шапка */
.home-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  height: 56px;
  background: var(--header-bg);
  backdrop-filter: blur(40px);
  border-bottom: 1px solid var(--border-subtle);
  position: relative;
  z-index: 2;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo {
  font-family: 'Syne', sans-serif;
  font-size: 18px;
  font-weight: 800;
  background: linear-gradient(135deg, #a78bfa, #60a5fa, #f472b6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-accent {
  font-size: 18px;
}

.logo-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #8b5cf6;
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.5);
  flex-shrink: 0;
}

.logo-sub {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.theme-toggle {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-input);
  border: 1px solid var(--border-medium);
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-secondary);
}

.theme-toggle:hover {
  background: var(--bg-hover);
  transform: rotate(20deg);
}

/* контент */
.home-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 56px 32px;
  position: relative;
  z-index: 1;
}

.welcome-section {
  margin-bottom: 40px;
}

.welcome-section h1 {
  margin: 0 0 6px;
  font-size: 32px;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.03em;
}

.welcome-sub {
  margin: 0;
  font-size: 13px;
  color: var(--text-secondary);
}

/* сетка досок */
.boards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
}

.board-card {
  position: relative;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  padding: 24px;
  min-height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  text-decoration: none;
  overflow: hidden;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
}

.board-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.06) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}

.board-card:hover {
  background: var(--bg-card-hover);
  border-color: rgba(139, 92, 246, 0.2);
  transform: translateY(-4px) rotateX(1deg);
  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.4),
    0 0 60px rgba(139, 92, 246, 0.06);
}

.board-card:hover::after {
  opacity: 1;
}

.board-card-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #a78bfa, #60a5fa, #f472b6);
  opacity: 0;
  transition: opacity 0.3s;
}

.board-card:hover .board-card-bar {
  opacity: 1;
}

.board-card-content {
  position: relative;
  z-index: 1;
}

.board-name {
  margin: 0 0 10px;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.board-stats {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.stat-value {
  font-size: 13px;
  font-weight: 700;
  color: #a78bfa;
}

.stat-label {
  font-size: 11px;
  color: var(--text-secondary);
}

.stat-dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--text-muted);
}

.board-delete {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: 8px;
  color: var(--text-muted);
  font-size: 12px;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;
  z-index: 2;
}

.board-card:hover .board-delete {
  opacity: 1;
}

.board-delete:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

/* создание доски */
.create-card {
  justify-content: center;
  align-items: center;
  gap: 14px;
  background: transparent;
  border: 1px dashed rgba(139, 92, 246, 0.15);
  cursor: default;
}

.create-card::after {
  display: none;
}

.create-card:hover {
  border-color: rgba(139, 92, 246, 0.35);
  background: rgba(139, 92, 246, 0.03);
  transform: none;
  box-shadow: none;
}

.create-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(139, 92, 246, 0.08);
  color: #a78bfa;
  font-size: 22px;
  font-weight: 300;
}

.create-input {
  width: 100%;
  padding: 8px 14px;
  background: var(--bg-input);
  border: 1px solid var(--border-medium);
  border-radius: 10px;
  color: var(--text-primary);
  font-size: 13px;
  font-family: 'Outfit', sans-serif;
  text-align: center;
  outline: none;
  transition: all 0.2s;
}

.create-input::placeholder {
  color: var(--text-placeholder);
}

.create-input:focus {
  background: var(--bg-input-focus);
  border-color: rgba(139, 92, 246, 0.3);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

.create-btn {
  padding: 8px 20px;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  font-family: 'Outfit', sans-serif;
  cursor: pointer;
  transition: all 0.2s;
}

.create-btn:hover {
  background: #7c3aed;
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
}

.board-favorite {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: 8px;
  color: var(--text-muted);
  font-size: 14px;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;
  z-index: 2;
}

.board-card:hover .board-favorite {
  opacity: 1;
}

.board-favorite.active {
  opacity: 1;
  color: #f59e0b;
}

.board-favorite:hover {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
}

/* мобильная версия */
@media (max-width: 768px) {
  .home-header {
    padding: 0 16px;
    height: 52px;
  }

  .home-content {
    padding: 28px 16px;
  }

  .welcome-section h1 {
    font-size: 24px;
  }

  .boards-grid {
    grid-template-columns: 1fr;
  }
}
</style>
