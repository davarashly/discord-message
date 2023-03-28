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

const token = ref<string>("")

const onSubmit = async () => {
  try {
    const res = await fetch("/api/token", {
      method: "post",
      body: JSON.stringify({ token: token.value })
    }).then((r) => r.json())
    console.log(res)
  } catch (e) {
    console.error(e)
  }
}
</script>
