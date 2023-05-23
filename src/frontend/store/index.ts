import { defineStore, _GettersTree } from "pinia"
import { IUserData } from "../../core/interfaces"

export type RootState = {
  userData: Partial<IUserData> | undefined
}

export const useStore = defineStore<
  "userData",
  RootState,
  _GettersTree<RootState>,
  {
    updateUserData: () => void
    cleanUserData: () => void
  }
>({
  id: "userData",
  state: () => ({
    userData: document.cookie ? JSON.parse(document.cookie.replace("userData=", "")) : undefined
  }),
  actions: {
    updateUserData() {
      const userData = document.cookie ? JSON.parse(document.cookie.replace("userData=", "")) : undefined

      this.userData = userData
    },
    cleanUserData() {
      this.userData = undefined
    }
  }
})
