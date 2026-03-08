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
  background: linear-gradient(
    135deg,
    var(--bg-gradient-1),
    var(--bg-gradient-2),
    var(--bg-gradient-3)
  );
}

/* ===== Header ===== */
.home-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 32px;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo {
  font-size: 22px;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.04em;
}

.logo-accent {
  color: var(--accent);
  font-size: 24px;
}

.logo-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--accent);
  flex-shrink: 0;
}

.logo-sub {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.theme-toggle {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;
}

.theme-toggle:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: rotate(20deg);
}

/* ===== Content ===== */
.home-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 48px 32px;
}

.welcome-section {
  margin-bottom: 32px;
}

.welcome-section h1 {
  margin: 0 0 4px;
  font-size: 28px;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.welcome-sub {
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary);
}

/* ===== Board Grid ===== */
.boards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.board-card {
  position: relative;
  background: var(--bg-column);
  border-radius: 14px;
  padding: 20px;
  min-height: 130px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  text-decoration: none;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition:
    transform 0.2s,
    box-shadow 0.2s,
    border-color 0.2s;
}

.board-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
  border-color: rgba(139, 92, 246, 0.3);
}

.board-card-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--accent), #a78bfa);
  opacity: 0;
  transition: opacity 0.2s;
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
  font-size: 17px;
  font-weight: 700;
  color: var(--text-primary);
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
  font-size: 14px;
  font-weight: 700;
  color: var(--accent);
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.stat-dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--text-secondary);
  opacity: 0.5;
}

.board-delete {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: 6px;
  color: var(--text-muted);
  font-size: 14px;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;
  z-index: 2;
}

.board-card:hover .board-delete {
  opacity: 1;
}

.board-delete:hover {
  background: rgba(239, 68, 68, 0.15);
  color: var(--danger);
}

/* ===== Create Card ===== */
.create-card {
  justify-content: center;
  align-items: center;
  gap: 12px;
  background: transparent;
  border: 2px dashed rgba(139, 92, 246, 0.25);
  cursor: default;
}

.create-card:hover {
  border-color: rgba(139, 92, 246, 0.5);
  background: rgba(139, 92, 246, 0.04);
  transform: none;
  box-shadow: none;
}

.create-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(139, 92, 246, 0.12);
  color: var(--accent);
  font-size: 22px;
  font-weight: 300;
}

.create-input {
  width: 100%;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  text-align: center;
  outline: none;
  transition: all 0.2s;
}

.create-input::placeholder {
  color: var(--text-secondary);
}

.create-input:focus {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.12);
}

.create-btn {
  padding: 8px 20px;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.create-btn:hover {
  background: #7c3aed;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

.board-favorite {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: 6px;
  color: var(--text-muted);
  font-size: 16px;
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
  background: rgba(245, 158, 11, 0.15);
}

/* ===== Mobile ===== */
@media (max-width: 768px) {
  .home-header {
    padding: 12px 16px;
  }

  .home-content {
    padding: 24px 16px;
  }

  .welcome-section h1 {
    font-size: 22px;
  }

  .boards-grid {
    grid-template-columns: 1fr;
  }
}
</style>
