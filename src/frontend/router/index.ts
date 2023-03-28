import { createRouter, createWebHistory, Router, RouteRecordRaw } from "vue-router"
import Home from "../views/Home.vue"
import Settings from "../views/Settings.vue"

const routes: RouteRecordRaw[] = [
  // Add your routes here
  { path: "/", component: Home },
  { path: "/settings", component: Settings }
]

const router: Router = createRouter({
  history: createWebHistory(),
  routes,
  linkActiveClass: "active"
})

export default router
