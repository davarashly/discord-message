<template>
  <form @submit.prevent="onSubmit" method="post" name="submit_form">
    <div class="mb-3">
      <label for="username" class="form-label">Логин</label>
      <input v-model="user.username" type="text" class="form-control" id="username" />
    </div>
    <div class="mb-3">
      <label for="password" class="form-label">Пароль</label>
      <input v-model="user.password" type="password" class="form-control" id="password" />
    </div>

    <button class="btn btn-primary" name="submit_form">
      Вход
      <div v-if="isLoading" class="spinner-border ms-2" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </button>
  </form>
</template>

<script lang="ts" setup>
import { reactive } from "vue"
import { useRouter } from "vue-router"
import { useStore } from "../store"
import useFetch from "../compositions/useFetch"

const router = useRouter()
const store = useStore()

const user = reactive<{ username: string; password: string }>({ username: "", password: "" })
const { fetch, isLoading } = useFetch("/api/auth", "post")

const onSubmit = async () => {
  try {
    await fetch(user)
    store.updateUserData()

    await router.push("/")
  } catch (e) {
    console.error(e)
  }
}
</script>

<style lang="scss" scoped>
form {
  max-width: 500px;
  margin-inline: auto;
}
</style>
