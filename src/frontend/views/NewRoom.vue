<template>
  <div class="container">
    <div class="row">
      <div class="col mx-auto" style="max-width: 600px">
        <input type="text" class="form-control mb-3" placeholder="Название комнаты" v-model="room.roomName" />
        <input type="text" class="form-control mb-3" placeholder="Ссылка на видео" v-model="room.url" />
        <input type="text" class="form-control mt-3" placeholder="Изображение" v-model="room.thumbnail" />
      </div>
    </div>
    <div class="row mt-4">
      <div class="col">
        <div class="d-flex justify-content-center">
          <button class="btn btn-secondary me-3" @click="reset()">Сбросить</button>
          <button class="btn btn-primary me-3" :disabled="isLoading" @click="onSubmit()">
            Сохранить
            <div v-if="isLoading" class="spinner-border ms-2" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeMount, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import useFetch from "../compositions/useFetch"
import { IRoom, IRoomPayload } from "../../core/types"

const route = useRoute()
const router = useRouter()

const room = ref<IRoomPayload>({
  roomName: "",
  url: "",
  thumbnail: "",
})

const reset = (skipConfirm = false) => {
  if (!skipConfirm && !confirm("Дядь, подумой, точно хочешь сбросить этот пост?")) {
    return
  }

  room.value = {
    roomName: "",
    url: "",
    thumbnail: "",
  }
}

const { fetch: saveRoom, isLoading } = useFetch(`/api/rooms/`, "post")

const onSubmit = async () => {
  try {
    await saveRoom({ room: room.value })
    await router.push("/")
  } catch (e) {
    console.error(e)
  }
}
</script>

<style lang="scss" scoped>
pre {
  max-width: 500px;
  margin-inline: auto;
}

textarea {
  min-height: 40vh;

  &:disabled + label {
    opacity: 0.3;
  }

  @media (min-width: 768px) {
    min-height: 250px;
  }
}
</style>
