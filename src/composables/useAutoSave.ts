import { ref, watch, type WatchSource } from 'vue'

export function useAutoSave(source: WatchSource) {
  const status = ref<'idle' | 'saving' | 'saved'>('idle')
  let timer: ReturnType<typeof setTimeout>

  watch(
    source,
    () => {
      status.value = 'saving'
      clearTimeout(timer)
      timer = setTimeout(() => {
        status.value = 'saved'
        setTimeout(() => {
          status.value = 'idle'
        }, 2000)
      }, 500)
    },
    { deep: true },
  )

  return { status }
}
