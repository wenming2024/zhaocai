import { createRouter, createWebHistory } from 'vue-router'
import DataView from '../views/DataView.vue'
import GoogleStatusView from "../views/GoogleStatusView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: DataView,
    },
    {
      path: "/google-status",
      name: "google-status",
      component: GoogleStatusView,
    },
  ],
});

export default router 