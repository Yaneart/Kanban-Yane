import { createRouter, createWebHistory } from 'vue-router'
import BoardView from '../views/BoardView.vue'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/board/:id',
    name: 'board',
    component: BoardView,
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
