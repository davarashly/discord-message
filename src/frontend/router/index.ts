import { createRouter, createWebHistory, Router, RouteRecordRaw } from "vue-router"
import Home from "../views/Home.vue"
import Post from "../views/Post.vue"
import Settings from "../views/Settings.vue"
import Login from "../views/Login.vue"
import { useStore } from "../store"

const routes: RouteRecordRaw[] = [
  { path: "/", redirect: "/posts" },
  { path: "/posts", component: Home },
  { path: "/posts/:idx", component: Post },
  { path: "/settings", component: Settings },
  { path: "/login", component: Login }
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
