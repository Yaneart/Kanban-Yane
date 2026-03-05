import { computed } from 'vue'
import type { Board } from '@/types'
import { useThemeStore } from '@/stores/theme'

const backgrounds = [
  // Тёмные
  'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
  'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
  'linear-gradient(135deg, #2d1b69, #6b21a8, #9333ea)',
  'linear-gradient(135deg, #064e3b, #065f46, #047857)',
  'linear-gradient(135deg, #7f1d1d, #991b1b, #b91c1c)',
  'linear-gradient(135deg, #1a1033, #2d1b69, #4a2c8a)',
  // Светлые
  'linear-gradient(135deg, #e0c3fc, #8ec5fc, #f5f7fa)',
  'linear-gradient(135deg, #fbc2eb, #a6c1ee, #c2e9fb)',
  'linear-gradient(135deg, #a8edea, #fed6e3, #fefbd8)',
  'linear-gradient(135deg, #d4fc79, #96e6a1, #c2ffd8)',
  'linear-gradient(135deg, #ffecd2, #fcb69f, #ff9a9e)',
  'linear-gradient(135deg, #a1c4fd, #c2e9fb, #e8f0fe)',
  'linear-gradient(135deg, #f3e7e9, #e3eeff, #d4e4ff)',
  'linear-gradient(135deg, #fad0c4, #ffd1ff, #e8cff7)',
  // Однотонные
  '#1a1a2e',
  '#0f172a',
  '#1e293b',
  '#f0eaf5',
  '#e8e0f0',
  '#f5f7fa',
]

function getHexBrightness(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (r * 299 + g * 587 + b * 114) / 1000
}

export function useBackground(board: Board) {
  const themeStore = useThemeStore()

  const boardStyle = computed(() => {
    const bg = board.background
    if (!bg) {
      return {
        background:
          'linear-gradient(135deg, var(--bg-gradient-1), var(--bg-gradient-2), var(--bg-gradient-3))',
      }
    }
    if (bg.startsWith('http')) {
      return {
        backgroundImage: `url(${bg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    }
    return { background: bg }
  })

  function setBackground(bg: string) {
    board.background = bg

    const hexMatch = bg.match(/#[0-9a-fA-F]{6}/)
    if (hexMatch) {
      const brightness = getHexBrightness(hexMatch[0])
      const shouldBeLight = brightness > 128
      if (
        (shouldBeLight && themeStore.theme === 'dark') ||
        (!shouldBeLight && themeStore.theme === 'light')
      ) {
        themeStore.toggleTheme()
      }
    }
  }

  function resetBackground() {
    board.background = undefined
  }

  return { backgrounds, boardStyle, setBackground, resetBackground }
}
