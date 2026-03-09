// карточка
export interface Card {
  id: string
  title: string
  description: string
  createdAt: number
  priority: 'high' | 'medium' | 'low'
  deadline?: number
  subtask?: SubTask[]
  tags?: Tag[]
  comments?: Comment[]
  archived?: boolean
}
// колонка
export interface Column {
  id: string
  title: string
  cards: Card[]
  wipLimit?: number
}
// доска
export interface Board {
  id: string
  title: string
  columns: Column[]
  background?: string
  favorite?: boolean
}
// история
export interface HistoryEntry {
  id: string
  action: string
  timestamp: number
}
// подзадача
export interface SubTask {
  id: string
  text: string
  done: boolean
}
// тег
export interface Tag {
  id: string
  name: string
  color: string
}
// комментарий
export interface Comment {
  id: string
  text: string
  createdAt: number
}
// уведомление
export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}
// шаблон карточки
export interface CardTemplate {
  id: string
  name: string
  priority: 'high' | 'medium' | 'low'
  tags: Tag[]
  subtasks: SubTask[]
  description: string
}
