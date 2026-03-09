import { useLocalStorage } from '@/composables/useLocalStorage'
import type { CardTemplate } from '@/types'
import { defineStore } from 'pinia'

export const useTemplateStore = defineStore('templates', () => {
  const templates = useLocalStorage<CardTemplate[]>('templates', [])

  function addTemplate(template: Omit<CardTemplate, 'id'>) {
    templates.value.push({ ...template, id: crypto.randomUUID() })
  }

  function deleteTemplate(id: string) {
    templates.value = templates.value.filter((e) => e.id !== id)
  }

  return { templates, addTemplate, deleteTemplate }
})
