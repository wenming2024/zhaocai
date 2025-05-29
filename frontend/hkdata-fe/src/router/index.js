import { createRouter, createWebHistory } from 'vue-router'
import DataView from '../views/DataView.vue'
import GoogleStatusView from "../views/GoogleStatusView.vue";
import MeituanStatusView from "../views/MeituanStatusView.vue";
import GangjiaosuoStatusView from "../views/GangjiaosuoStatusView.vue";
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
    {
      path: "/meituan-status",
      name: "meituan-status",
      component: MeituanStatusView,
    },
    {
      path: "/gangjiaosuo-status",
      name: "gangjiaosuo-status",
      component: GangjiaosuoStatusView,
    },
  ],
});

export default router 