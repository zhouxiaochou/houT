import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
// ? 常量路由：任意用户都能操作得路由，就是都能看到这个路由组件
export const constantRoutes = [{
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: {
        title: '首页',
        icon: 'dashboard'
      }
    }]
  },
]

// ? 异步路由： 权限路由，用户拥有这个路由对应得name信息，这个路由组件才能被用户所操作，才能看到
export const allAsyncRouters=[
  {
    path:'/acl',
    name:'Acl',
    component:Layout,
    redirect:'/acl/user',
    meta:{
      title:'权限管理',
      icon:'el-icon-lock'
    },
    children:[
      {
        name:'User',
        path:'user',
        component:() => import('@/views/acl/user'),
        meta:{
          title:'用户管理'
        }
      },
      {
        name:'Permission',
        path:'permission',
        component:() => import('@/views/acl/permission'),
        meta:{
          title:'菜单管理'
        }
      },
      {
        name:'Role',
        path:'role',
        component:() => import('@/views/acl/role'),
        meta:{
          title:'角色管理'
        }
      },
      {
        name:'Authority',
        path:'role/authority',
        component:() => import('@/views/acl/role/authority.vue'),
        meta:{  
          title:'角色授权'
        },
        hidden:true
      }
    ]
  },
  {
    path: '/product',
    name: 'Product',
    component: Layout,
    redirect: '/product/category/list',
    meta: {
      title: '商品管理',
      icon: 'el-icon-s-shop'
    },
    children: [
      {
        name: 'Category',
        path: 'category/list',
        component: () => import('@/views/product/category/list'),
        meta: {
          title: '分类管理'
        }
      },
      {
        name: 'Trademark',
        path: 'trademark/list',
        component: () => import('@/views/product/trademark/list'),
        meta: {
          title: '品牌管理'
        }
      },
      {
        name: 'Attr',
        path: 'attr/list',
        component: () => import('@/views/product/attr/list'),
        meta: {
          title: '平台属性管理'
        }
      },
      {
        name: 'Spu',
        path: 'spu/list',
        component: () => import('@/views/product/spu/list'),
        meta: {
          title: 'SPU管理'
        }
      },
      {
        name: 'Sku',
        path: 'sku/list',
        component: () => import('@/views/product/sku/list'),
        meta: {
          title: 'SKU管理'
        }
      },
    ]
  }
]

// ? 任意路由，用户随意输入得非法路由，全部都会转到404路由界面
// ! 注册这个路由得时候，一定要放在后面注册
export const anyRoute =
{
  path: '*',
  redirect: '/404',
  hidden: true
}

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({
    y: 0
  }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
