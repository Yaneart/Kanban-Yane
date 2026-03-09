import type { Board } from '@/types'
import { useToast } from '@/composables/useToast'

export function useBoardActions(
  board: Board,
  emit: (event: 'update:board', board: Board) => void,
  addHistory: (action: string) => void,
) {
  const { addToast } = useToast()

  function exportBoard() {
    const json = JSON.stringify(board, null, 2)
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
      reader.onerror = () => {
        addToast('Ошибка чтения файла', 'error')
      }
      reader.readAsText(file)
    }
    input.click()
  }

  return { exportBoard, importBoard }
}
