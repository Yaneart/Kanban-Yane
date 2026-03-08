import { defineStore } from 'pinia'
import { useLocalStorage } from '@/composables/useLocalStorage'
import type { Board } from '@/types'

export const useBoardsStore = defineStore('boards', () => {
  const boards = useLocalStorage<Board[]>('kanban-boards', [])

  function addBoard(board: Board) {
    boards.value.push(board)
  }

  function deleteBoard(id: string) {
    boards.value = boards.value.filter((b) => b.id !== id)
  }

  function getBoard(id: string) {
    return boards.value.find((b) => b.id === id)
  }

  function updateBoard(id: string, newBoard: Board) {
    const index = boards.value.findIndex((b) => b.id === id)
    if (index !== -1) {
      boards.value[index] = newBoard
    }
  }

  function toggleFavorite(id: string) {
    const board = boards.value.find((e) => e.id === id)

    if (board) {
      board.favorite = !board.favorite
    }
  }

  return { boards, addBoard, deleteBoard, getBoard, updateBoard, toggleFavorite }
})
