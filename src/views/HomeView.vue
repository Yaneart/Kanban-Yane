<script setup lang="ts">
import { useLocalStorage } from '@/composables/useLocalStorage'
import type { Board } from '@/types'
import { ref } from 'vue'

const boards = useLocalStorage<Board[]>('kanban-boards', [])
const newTitle = ref('')

function createBoard() {
  const title = newTitle.value.trim()
  if (!title) return

  const newBoard: Board = {
    id: `board-${Date.now()}`,
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
    <h1>Мои доски</h1>
    <div>
      <input v-model="newTitle" placeholder="Название доски" @keyup.enter="createBoard" />
      <button @click="createBoard">Создать</button>
    </div>
    <div>
      <div v-for="board in boards" :key="board.id" class="board-card">
        <RouterLink :to="'/board/' + board.id">{{ board.title }}</RouterLink>
        <button @click="deleteBoard(board.id)">&times;</button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
