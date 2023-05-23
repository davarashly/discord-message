<template>
  <form @submit.prevent="onSubmit">
    <div class="input-group">
      <span class="input-group-text">Discord-токен</span>
      <input v-model="token" type="text" class="form-control" aria-label="Dollar amount (with dot and two decimal places)" />
    </div>
    <div class="d-flex justify-content-center mt-4">
      <button class="btn btn-primary">
        Сохранить
        <div v-if="isLoading" class="spinner-border ms-2" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </button>
    </div>
  </form>
</template>

<script lang="ts" setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import { useStore } from "../store"
import useFetch from "../compositions/useFetch"

const store = useStore()
const token = ref<string>(store.userData?.discordToken || "")
const router = useRouter()

const { fetch, isLoading } = useFetch("/api/token", "post")

const onSubmit = async () => {
  try {
    await fetch({ token: token.value })
    store.updateUserData()

    await router.push("/")
  } catch (e) {
    console.error(e)
  }
}
</script>
