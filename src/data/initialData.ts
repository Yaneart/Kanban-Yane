import type {Board}  from "@/types";

export const initialData: Board = {
  columns: [
    {
      id: "col-1",
      title: "To Do",
      cards: [
        {
          id: "card-1",
          title: "Изучить Vue 3",
          description: "Пройти основы Composition API и реактивности",
          createdAt: Date.now(),
        },
        {
          id: "card-2",
          title: "Сделать kanban доску",
          description: "Написать проект на Vue 3",
          createdAt: Date.now(),
        },
      ]
    },
    {
      id: 'col-2',
      title: 'In Progress',
      cards: [],
    },
    {
      id: 'col-3',
      title: 'Done',
      cards: [],
    },
  ]
};