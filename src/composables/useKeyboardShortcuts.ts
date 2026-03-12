import { onMounted, onUnmounted } from 'vue'

interface ShortcutOptions {
  onNewCard?: () => void
  onDelete?: () => void
  onUndo?: () => void
}

export function useKeyboardShortcuts(options: ShortcutOptions) {
  function isTyping(): boolean {
    const el = document.activeElement
    if (!el) return false

    const tag = el.tagName.toLowerCase()
    return tag === 'input' || tag === 'textarea' || (el as HTMLElement).isContentEditable
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (isTyping()) return
    switch (e.code) {
      case 'KeyN':
        e.preventDefault()
        options.onNewCard?.()
        break
      case 'Delete':
        e.preventDefault()
        options.onDelete?.()
        break
    }

    if (e.ctrlKey && e.code === 'KeyZ') {
      if (!isTyping()) {
        e.preventDefault()
        options.onUndo?.()
      }
    }
  }
  onMounted(() => document.addEventListener('keydown', handleKeyDown))
  onUnmounted(() => document.removeEventListener('keydown', handleKeyDown))
}
