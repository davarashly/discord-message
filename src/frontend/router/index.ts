import { createRouter, createWebHistory, Router, RouteRecordRaw } from "vue-router"

import Rooms from "../views/Rooms.vue"
import Room from "../views/Room.vue"
import NewRoom from "../views/NewRoom.vue"

// import Settings from "../views/Settings.vue"
import Login from "../views/Login.vue"
import NotFound from "../views/NotFound.vue"
import { useStore } from "../store"

const routes: RouteRecordRaw[] = [
  { path: "/", redirect: "/rooms" },
  { path: "/rooms", component: Rooms },
  { path: "/rooms/new", component: NewRoom },
  { path: "/rooms/:author/:id", component: Room },
  // { path: "/settings", component: Settings },
  { path: "/login", component: Login },
  { path: "/:catchAll(.*)", name: "NotFound", component: NotFound },
]

const router: Router = createRouter({
  history: createWebHistory(),
  routes,
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
