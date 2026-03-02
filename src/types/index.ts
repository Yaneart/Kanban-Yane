// Карточка задачи
export interface Card {
  id: string
  title: string
  description: string
  createdAt: number
  priority: 'high' | 'medium' | 'low'
  deadline?: number
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
  columns: Column[]
}
//История действий
export interface HistoryEntry {
  id: string
  action: string
  timestamp: number
}
