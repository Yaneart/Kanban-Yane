import { ref, inject, provide, type InjectionKey, type Ref } from 'vue'
import type { HistoryEntry } from '@/types'

interface HistoryContext {
  history: Ref<HistoryEntry[]>
  addHistory: (action: string) => void
}

const historyKey: InjectionKey<HistoryContext> = Symbol('history')

export function provideHistory() {
  const history = ref<HistoryEntry[]>([])

  function addHistory(action: string) {
    history.value.unshift({
      id: crypto.randomUUID(),
      action,
      timestamp: Date.now(),
    })
  }

  const context = { history, addHistory }
  provide(historyKey, context)
  return context
}

export function useHistory() {
  const context = inject(historyKey)
  if (!context) throw new Error('useHistory must be used within provideHistory')
  return context
}
