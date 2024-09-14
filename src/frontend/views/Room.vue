<template>
  <div class="container">
    <div v-if="isLoading" class="loading">Loading...</div>
    <div v-else-if="room" class="room-details mx-auto" style="max-width: 650px">
      <video
        class="img-fluid w-100"
        ref="videoPlayer"
        v-if="room.url"
        controls
        @click.prevent
        @keydown.space.prevent
        @play="onVideoUpdate"
        @pause="onVideoUpdate"
        @timeupdate="onVideoUpdate"
        @seeking="onVideoUpdate"
        @seeked="onVideoUpdate"
        :class="{
          controls: store.userData?.nickname === room.author,
        }"
      >
        <source :src="room.url" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
    <div v-else class="error">Room not found.</div>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeRouteUpdate, useRoute, useRouter } from "vue-router"
import { ref, onBeforeMount, computed, onMounted, onUnmounted, watch } from "vue"
import useFetch from "../compositions/useFetch"
import { IRoom } from "../../core/types"
import { useStore } from "../store"

import { io } from "socket.io-client"

const route = useRoute()
const router = useRouter()
const store = useStore()

const { id, author } = route.params as { id: string; author: string }
const { data, isLoading, fetch } = useFetch<{ room: IRoom }>(`/api/rooms/${author}/${id}`)
const room = computed(() => data.value?.room)
const socket = ref(null)
const videoPlayer = ref<HTMLVideoElement | null>(null)

watch(
  () => room.value?.id,
  () => {
    socket.value.emit("join-room", { author: room.value?.author, id: room.value?.id })
  }
)

onBeforeMount(async () => {
  try {
    await fetch()
  } catch (e) {
    await router.push("/")
  }
})

// Initialize socket.io connection
onMounted(() => {
  socket.value = io("http://localhost:8080") // Replace with your backend URL

  // Listen for socket events (optional, if you need to receive data from the server)
  if (store.userData?.nickname !== room.author) {
    socket.value.on("video-update", (data) => {
      if (videoPlayer.value) {
        // Apply the received data to control the video (e.g., sync with others)

        if (Math.abs(videoPlayer.value.currentTime - data.currentTime) >= 2) {
          videoPlayer.value.currentTime = data.currentTime
        }

        if (data.isPlaying) {
          videoPlayer.value.play()
        } else {
          videoPlayer.value.pause()
        }
      }
    })
  }
})

onBeforeRouteUpdate(async (to, from) => {
  if (to.params.id !== from.params.id) {
    await fetch()
  } else {
    socket.value.emit("leave-room", { author: room.value?.author, id: room.value?.id })
    socket.value.disconnect()
  }
})

onUnmounted(() => {
  socket.value.emit("leave-room", { author: room.value?.author, id: room.value?.id })
  socket.value.disconnect()
})

const onVideoUpdate = () => {
  if (room.value?.author === store.userData?.nickname) {
    socket.value?.emit("video-update", {
      author: room.value?.author,
      id: room.value?.id,
      currentTime: videoPlayer.value?.currentTime,
      isPlaying: !videoPlayer.value?.paused,
    })
  }
}
</script>

<style scoped>
.loading {
  text-align: center;
  font-size: 1.2rem;
  color: #888;
}

.error {
  text-align: center;
  color: red;
}

video:not(.controls) {
  &::-webkit-media-controls-play-button {
    display: none;
  }

  &::-webkit-media-controls-timeline {
    display: none;
  }
}
</style>
