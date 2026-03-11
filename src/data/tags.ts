import type { Tag } from '@/types'

export const availableTags: Tag[] = [
  { id: 'bug', name: 'Баг', color: '#ef4444' },
  { id: 'feature', name: 'Фича', color: '#8b5cf6' },
  { id: 'urgent', name: 'Срочно', color: '#f59e0b' },
  { id: 'design', name: 'Дизайн', color: '#ec4899' },
  { id: 'refactor', name: 'Рефакторинг', color: '#06b6d4' },
  { id: 'testing', name: 'Тестирование', color: '#84cc16' },
  { id: 'research', name: 'Исследование', color: '#3b82f6' },
  { id: 'blocked', name: 'Заблокировано', color: '#78716c' },
  { id: 'review', name: 'На ревью', color: '#f97316' },
  { id: 'idea', name: 'Идея', color: '#14b8a6' },
]
