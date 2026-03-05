<script setup lang="ts">
import { useRoute } from 'vue-router'
import type { Board } from '@/types'
import { computed } from 'vue'
import KanbanBoard from '@/components/KanbanBoard.vue'
import { useBoardsStore } from '@/stores/boards'

const route = useRoute()
const boardsStore = useBoardsStore()

const board = computed(() => {
  return boardsStore.getBoard(route.params.id as string)
})

function updateBoard(newBoard: Board) {
  boardsStore.updateBoard(route.params.id as string, newBoard)
}
</script>

<template>
  <div v-if="board">
    <KanbanBoard :board="board" @update:board="updateBoard" />
  </div>
  <div v-else>
    <h1>Доска не найдена</h1>
  </div>
</template>

<style scoped></style>
