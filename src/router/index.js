import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useUserStore } from '@/stores/user.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true } // 需要登录才能访问
    },
  ],
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  // 检查路由是否需要认证
  if (to.meta.requiresAuth) {
    // 如果需要认证但用户未登录，重定向到首页
    if (!userStore.isLoggedIn) {
      console.log('访问受保护页面但未登录，重定向到首页')
      next({ name: 'home' })
      return
    }
    
    // 检查token是否有效
    if (!userStore.checkTokenValid()) {
      console.log('Token无效，重定向到首页')
      next({ name: 'home' })
      return
    }
  }
  
  next()
})

export default router
