import { ref, watch, type Ref } from 'vue'

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const stored = localStorage.getItem(key)
  let initial: T = defaultValue

  if (stored) {
    try {
      initial = JSON.parse(stored)
    } catch {
      initial = defaultValue
    }
  }

  const data = ref(initial) as Ref<T>

  watch(
    data,
    (value) => {
      localStorage.setItem(key, JSON.stringify(value))
    },
    { deep: true },
  )

  return data
}
