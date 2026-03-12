import { ref, inject, provide, type InjectionKey, type Ref } from 'vue'
import type { Column, HistoryEntry } from '@/types'

interface HistoryContext {
  history: Ref<HistoryEntry[]>
  addHistory: (action: string) => void
  undo: () => Column[] | null
  saveSnapshot: () => void
}

const historyKey: InjectionKey<HistoryContext> = Symbol('history')

export function provideHistory(columns: Ref<Column[]>) {
  const history = ref<HistoryEntry[]>([])
  const snapshots = ref<Column[][]>([])
  let pendingSnapshot: Column[] | null = null

  function saveSnapshot() {
    pendingSnapshot = JSON.parse(JSON.stringify(columns.value))
  }

  function addHistory(action: string) {
    const snap = pendingSnapshot ?? JSON.parse(JSON.stringify(columns.value))
    pendingSnapshot = null

    snapshots.value.unshift(snap)
    history.value.unshift({
      id: crypto.randomUUID(),
      action,
      timestamp: Date.now(),
    })
  }

  function undo(): Column[] | null {
    if (snapshots.value.length === 0) return null
    const snapshot = snapshots.value.shift()!
    history.value.shift()
    return snapshot
  }

  const context = { history, addHistory, undo, saveSnapshot }
  provide(historyKey, context)
  return context
}

export function useHistory() {
  const context = inject(historyKey)
  if (!context) throw new Error('useHistory must be used within provideHistory')
  return context
}
