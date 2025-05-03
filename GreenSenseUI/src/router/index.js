import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue')
    },
    {
      path: '/model-performance',
      name: 'model-performance',
      component: () => import('@/views/ModelPerformanceView.vue')
    },
    {
      path: '/model-comparison',
      name: 'model-comparison',
      component: () => import('@/views/ModelComparisonView.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue')
    }
  ]
})

export default router 