<script setup lang="ts">
import { useLocalStorage } from '@/composables/useLocalStorage'
import { useThemeStore } from '@/stores/theme'
import type { Board } from '@/types'
import { ref } from 'vue'

const boards = useLocalStorage<Board[]>('kanban-boards', [])
const newTitle = ref('')
const themeStore = useThemeStore()

function createBoard() {
  const title = newTitle.value.trim()
  if (!title) return

  const newBoard: Board = {
    id: crypto.randomUUID().slice(0, 8),
    title,
    columns: [],
  }

  boards.value.push(newBoard)
  newTitle.value = ''
}

function deleteBoard(id: string) {
  boards.value = boards.value.filter((e) => e.id !== id)
}
</script>

<template>
  <div class="home">
    <header class="home-header">
      <h1>Мои доски</h1>
      <button class="theme-btn" @click="themeStore.toggleTheme()">
        {{ themeStore.theme === 'dark' ? '☀️' : '🌙' }}
      </button>
    </header>

    <div class="boards-grid">
      <div v-for="board in boards" :key="board.id" class="board-card">
        <RouterLink :to="'/board/' + board.id" class="board-link">
          {{ board.title }}
        </RouterLink>
        <button class="board-delete" @click="deleteBoard(board.id)">&times;</button>
      </div>

      <div class="board-card create-card">
        <input v-model="newTitle" placeholder="Название доски..." @keyup.enter="createBoard" />
        <button @click="createBoard">+ Создать</button>
      </div>
    </div>
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
  padding: 40px;
}

.home-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}

.home-header h1 {
  color: var(--text-primary);
  font-size: 28px;
  margin: 0;
}

.boards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.board-card {
  position: relative;
  background: var(--bg-column);
  border-radius: 12px;
  padding: 24px 16px;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.board-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px var(--shadow);
}

.board-link {
  color: var(--text-primary);
  text-decoration: none;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.board-delete {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 18px;
  cursor: pointer;
  opacity: 0;
  transition:
    opacity 0.2s,
    color 0.2s;
}

.board-card:hover .board-delete {
  opacity: 1;
}

.board-delete:hover {
  color: var(--danger);
}

.create-card {
  flex-direction: column;
  gap: 8px;
  border: 2px dashed var(--accent-soft);
  background: transparent;
}

.create-card input {
  width: 100%;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  background: var(--bg-input);
  color: var(--text-primary);
  outline: none;
  text-align: center;
}

.create-card input::placeholder {
  color: var(--text-placeholder);
}

.create-card button {
  padding: 8px 16px;
  background: var(--accent-btn);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background 0.2s;
}

.create-card button:hover {
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
</style>
