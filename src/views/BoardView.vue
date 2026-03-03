<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useLocalStorage } from '@/composables/useLocalStorage'
import type { Board } from '@/types'
import { computed } from 'vue'
import KanbanBoard from '@/components/KanbanBoard.vue';

const props = defineProps<{
  themeToggler: () => void
  theme: 'dark' | 'light'
}>()

const route = useRoute()
const boards = useLocalStorage<Board[]>('kanban-boards', [])

const board = computed(() => {
  return boards.value.find((b) => b.id === route.params.id)
})

function updateBoard(newBoard: Board) {
    const index = boards.value.findIndex(b => b.id === route.params.id)
    if (index !== -1) {
      boards.value[index] = newBoard
    }
  }
</script>

<template>
  <div v-if="board">
    <KanbanBoard
      :board="board"
      :theme-toggler="props.themeToggler"
      :theme="props.theme"
      @update:board="updateBoard"
    />
  </div>
  <div v-else>
    <h1>Доска не найдена</h1>
  </div>
</template>

<style scoped></style>
