import Vue from 'vue'
import VueRouter from 'vue-router'
import CreateOrderIndex from '@/views/create/index.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { 
      title: '登录', 
      requiresAuth: false 
    }
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/home/home.vue'),
    meta: { 
      title: '首页', 
      requiresAuth: false 
    }
  },
  {
    path: '/order',
    name: 'Order',
    component: () => import('@/views/order/index.vue'),
    meta: { 
      title: '订单列表', 
      requiresAuth: true 
    }
  },
  {
    path: '/user',
    name: 'User',
    component: () => import('@/views/user/index.vue'),
    meta: { 
      title: '个人中心', 
      requiresAuth: true 
    }
  },
  
  // 添加小程序风格的路径重定向
  {
    path: '/pages/order/list',
    redirect: '/order'
  },
  {
    path: '/pages/user/index',
    redirect: '/user'
  },

  {
    path: '/pages/home/home',
    redirect: '/home'
  },
  {
    path: '/',
    redirect: '/home'
  },
  {
      path: '/create',  // 访问路径是 /create
      name: 'CreateOrder',
      component: CreateOrderIndex  // 对应 create/index.vue 文件
    },
    {
      path: '/create/express',
      name: 'ExpressOrder',
      component: () => import('@/views/create/express.vue')
    },
    {
      path: '/create/meal',
      name: 'MealOrder',
      component: () => import('@/views/create/meal.vue')
    },
    {
      path: '/create/flower',
      name: 'FlowerOrder',
      component: () => import('@/views/create/flower.vue')
    },
    {
      path: '/create/snack',
      name: 'SnackOrder',
      component: () => import('@/views/create/snack.vue')
    }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// 白名单（不需要登录就能访问的页面）
const whiteList = ['/login', '/home', '/','/order']

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title || '飞飞跑单平台'
  
  // 获取 token
  const token = localStorage.getItem('token')
  
  // 打印调试信息
  console.log('路由跳转:', from.path, '->', to.path, 'token:', !!token)
  
  // 如果是白名单页面，直接放行
  if (whiteList.includes(to.path)) {
    next()
    return
  }
  
  // 检查是否需要登录
  if (to.meta.requiresAuth) {
    if (localStorage.getItem('token')) {
      next()
    } else {
      console.log('需要登录，跳转到登录页')
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    }
  } else {
    next()
  }
})

export default router