import { defineStore, _GettersTree } from "pinia"

export type RootState = {
  userData: { nickname?: string; token?: string } | undefined
}

export const useStore = defineStore<"userData", RootState, _GettersTree<RootState>, { updateUserData: () => void }>({
  id: "userData",
  state: () => ({
    userData: document.cookie ? JSON.parse(document.cookie.replace("userData=", "")) : undefined
  }),
  actions: {
    updateUserData() {
      const userData = document.cookie ? JSON.parse(document.cookie.replace("userData=", "")) : undefined

      this.$patch({ userData })
    }
  }
})
