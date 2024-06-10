import { Buffer } from "buffer";
window.Buffer = window.Buffer || Buffer;
import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'

const router = createRouter({
  // mode: 'hash',
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'MainPage',
      component: () => import('../components/MainPage.vue')
    },
  ]
})

export default router
