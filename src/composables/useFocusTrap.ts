import { onMounted, onUnmounted, type Ref } from 'vue'

export function useFocusTrap(containerRef: Ref<HTMLElement | null>) {
  function getFocusable(): HTMLElement[] {
    if (!containerRef.value) return []
    return Array.from(
      containerRef.value.querySelectorAll<HTMLElement>(
        'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])',
      ),
    )
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key !== 'Tab') return

    const focusable = getFocusable()
    if (!focusable.length) return

    const first = focusable[0]!
    const last = focusable[focusable.length - 1]!

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault()
        last.focus()
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }
  onMounted(() => {
    document.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown)
  })
}
