// Карточка задачи
export interface Card {
  id: string
  title: string
  description: string
  createdAt: number
  priority: 'high' | 'medium' | 'low'
  deadline?: number
  subtask?: SubTask[]
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
}
//История действий
export interface HistoryEntry {
  id: string
  action: string
  timestamp: number
}
//Под таски
export interface SubTask {
  id: string
  text: string
  done: boolean
}
