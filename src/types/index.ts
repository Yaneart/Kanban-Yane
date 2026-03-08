// Карточка задачи
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
// Колонка с задачами
export interface Column {
  id: string
  title: string
  cards: Card[]
  wipLimit?: number
}
// Доска с колонками
export interface Board {
  id: string
  title: string
  columns: Column[]
  background?: string
  favorite?: boolean
}
//История действий
export interface HistoryEntry {
  id: string
  action: string
  timestamp: number
}
//Подтаски
export interface SubTask {
  id: string
  text: string
  done: boolean
}
//Метки
export interface Tag {
  id: string
  name: string
  color: string
}
//Комментарий
export interface Comment {
  id: string
  text: string
  createdAt: number
}
//Тоаст
export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}
