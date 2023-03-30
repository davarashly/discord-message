import { createRouter, createWebHistory, Router, RouteRecordRaw } from "vue-router"
import Home from "../views/Home.vue"
import Settings from "../views/Settings.vue"
import { useStore } from "../store"

const routes: RouteRecordRaw[] = [
  // Add your routes here
  { path: "/", redirect: "/posts" },
  { path: "/posts", component: Home },
  { path: "/posts/:idx", component: import("../views/Post.vue") },
  { path: "/settings", component: Settings },
  { path: "/login", component: import("../views/Login.vue") }
]

const router: Router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, _from, next): Promise<void> => {
  const { userData } = useStore()

  if (!userData && to.path !== "/login") {
    next("/login")
  } else if (!!userData && to.path === "/login") {
    next("/")
  } else {
    next()
  }
})

export default router
