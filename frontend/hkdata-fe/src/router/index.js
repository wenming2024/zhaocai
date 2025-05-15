import { createRouter, createWebHistory } from 'vue-router'
import DataView from '../views/DataView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: DataView
    }
  ]
})

export default router 