import { useLocalStorage } from '@/composables/useLocalStorage'
import type { CardTemplate } from '@/types'
import { defineStore } from 'pinia'

export const useTemplateStore = defineStore('templates', () => {
  const templates = useLocalStorage<CardTemplate[]>('templates', [])

  function addTemplate(template: Omit<CardTemplate, 'id'>) {
    templates.value.push({ ...template, id: crypto.randomUUID() })
  }

  function deleteTemplate(id: string) {
    const index = templates.value.findIndex((e) => e.id === id)
    if (index !== -1) {
      templates.value.splice(index, 1)
    }
  }

  return { templates, addTemplate, deleteTemplate }
})
