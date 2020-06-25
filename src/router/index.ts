import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import store from '@/store'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    redirect: '/stats',
  },
  {
    path: '/combat',
    name: 'Combat',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "combat" */ '../views/Combat.vue'),
    beforeEnter: (to, from, next) => {
      const user = store.state.user

      if (user) {
        next()
      } else {
        next(false)
      }
    },
  },
  {
    path: '/stats',
    name: 'Stats',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "stats" */ '../views/Stats.vue'),
  },
  {
    path: '/rolls',
    name: 'Rolls',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "skills" */ '../views/Skills.vue'),
  },
]

const router = new VueRouter({
  mode: 'history',
  routes,
})

export default router
