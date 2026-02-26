// Карточка задачи
export interface Card {
  id: string;
  title: string;
  description: string;
  createdAt: number;
}
// Колонка с задачами
export interface Column {
  id: string;
  title: string;
  cards: Card[];
}
// Доска с колонками
export interface Board {
  columns: Column[];
}

