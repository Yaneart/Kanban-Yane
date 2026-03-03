import { defineStore } from 'pinia'
import { useLocalStorage } from '@/composables/useLocalStorage'
import { watchEffect } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const theme = useLocalStorage<'dark' | 'light'>('kanban-theme', 'dark')

  watchEffect(() => {
    document.documentElement.setAttribute('data-theme', theme.value)
  })

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  return { theme, toggleTheme }
})
