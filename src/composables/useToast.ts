import type { Toast } from '@/types'
import { inject, provide, ref, type InjectionKey, type Ref } from 'vue'

interface ToastContext {
  toasts: Ref<Toast[]>
  addToast: (message: string, type?: Toast['type']) => void
}

const toastKey: InjectionKey<ToastContext> = Symbol('toast')

export function provideToast() {
  const toasts = ref<Toast[]>([])

  function addToast(message: string, type: Toast['type'] = 'success') {
    const id = crypto.randomUUID()
    toasts.value.push({ id, message, type })
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id)
    }, 3000)
  }

  const context = { toasts, addToast }
  provide(toastKey, context)
  return context
}

export function useToast() {
  const context = inject(toastKey)
  if (!context)
    throw new Error('Функция useToast должна использоваться внутри функции provideToast.')
  return context
}
