import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login'),
    meta: {
      title: '登录'
    }
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('@/views/home'),
    meta: {
      title: '首页', keepAlive: true
    }
  },
  {
    path: '/home/evaluation',
    name: 'evaluation',
    component: () => import('@/views/evaluation'),
    meta: {
      title: '考评', keepAlive: true
    }
  }
]

const router = new VueRouter({
  routes
})
// , '/home'
const whiteList = ['/login','/home'] // 白名单，在白名单当中的路由可以免登录，直接进入。
// 全局前置守卫,当有路由进行跳转时就会进入这个守卫，
// 这个守卫方法接收三个参数：
// to: Route: 即将要进入的目标 路由对象
// from: Route: 当前导航正要离开的路由
// next: Function: 一定要调用该方法来 resolve 这个钩子。执行效果依赖 next 方法的调用参数。
router.beforeEach((to, from, next) => {
  // next()
  // 设置页面标题
  // document.title = '福建理工大学综合考评系统'
  // 判断用户是否登录，也就是是否能获得token值
  const hasToken = store.getters.token
  if (hasToken) {
    next()
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next('/login')
    }
  }
})
export default router
