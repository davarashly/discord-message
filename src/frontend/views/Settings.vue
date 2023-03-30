<template>
  <form @submit.prevent="onSubmit">
    <div class="input-group">
      <span class="input-group-text">Discord-токен</span>
      <input v-model="token" type="text" class="form-control" aria-label="Dollar amount (with dot and two decimal places)" />
    </div>
    <div class="d-flex justify-content-center mt-4">
      <button class="btn btn-dark">Сохранить</button>
    </div>
  </form>
</template>

<script lang="ts" setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import { useStore } from "../store"

const token = ref<string>(useStore().$state?.userData?.token || "")
const router = useRouter()
const store = useStore()

const onSubmit = async () => {
  try {
    await fetch("/api/token", {
      method: "post",
      body: JSON.stringify({ token: token.value })
    }).then((r) => r.json())

    store.updateUserData()

    await router.push("/")
  } catch (e) {
    console.error(e)
  }
}
</script>
