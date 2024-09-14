<template>
  <div class="container">
    <div class="row">
      <div class="col">
        <div v-if="isLoading" class="d-flex justify-content-center">
          <div
            class="spinner-border ms-2 text-secondary"
            role="status"
            style="scale: 5; --bs-spinner-border-width: 0.07em"
          >
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <div class="rooms" v-else>
          <router-link
            draggable="true"
            @dragstart="onDrag($event, idx)"
            @drop="onDrop($event, idx)"
            @dragover.prevent="dd.drag !== idx && (dd.drop = idx)"
            @dragleave.prevent="dd.drop = -1"
            @dragend.prevent="dd.drag = -1"
            :to="`/rooms/${rooms[idx].author}/${rooms[idx].id}`"
            v-for="(_room, idx) in renderedRooms"
            :class="{
              dragging: dd.drag === idx,
              dropping: dd.drop === idx,
              // disabled: !rooms[idx].active,
              // success: rooms[idx].status === 'success',
              // fail: rooms[idx].status === 'fail',
            }"
            class="room text-white text-decoration-none"
          >
            <div
              class="p-2 delete"
              style="position: absolute; top: 0.5rem; right: 0.5rem"
              @click.prevent="deleteRoomHandler(idx + 1)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-trash-fill"
                viewBox="0 0 16 16"
              >
                <path
                  d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z"
                />
              </svg>
            </div>
            <pre v-html="renderedRooms[idx]" />
            <div class="row">
              <div class="col">
                <img class="img-fluid mt-4" :src="rooms[idx].thumbnail" />
              </div>
            </div>
          </router-link>
          <router-link to="/rooms/new" class="room text-white text-decoration-none">
            <pre class="d-flex justify-content-center align-items-center" style="font-size: 72px">
              <span>+</span>
            </pre>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeMount, reactive, ref } from "vue"
import { IRoom } from "../../core/types"
import useFetch from "../compositions/useFetch"

const { fetch, isLoading, data } = useFetch<{ rooms: IRoom[] }>("/api/rooms")

const rooms = ref<IRoom[]>([])
const renderedRooms = computed<string[]>(() => rooms.value.map((room) => room.roomName))

onBeforeMount(async () => {
  try {
    await fetch()

    rooms.value = data.value?.rooms || []
  } catch (e) {
    console.error(e)
  }
})

const onDrag = (evt: DragEvent, roomIdx: number) => {
  evt.dataTransfer!.dropEffect = "move"
  evt.dataTransfer!.effectAllowed = "move"

  dd.drag = roomIdx
}

const onDrop = async (evt: DragEvent, roomIdx: number) => {
  if (dd.drag === -1) {
    return
  }

  const dragRoomIdx = dd.drag

  const tmp = rooms.value[dragRoomIdx]

  rooms.value[dragRoomIdx] = rooms.value[roomIdx]
  rooms.value[roomIdx] = tmp

  const { fetch } = useFetch("/api/rooms/order", "put", [dd.drag, dd.drop])
  await fetch()
}

const dd = reactive<Record<"drag" | "drop", number>>({
  drag: -1,
  drop: -1,
})

const deleteRoomHandler = async (idx: number) => {
  const { fetch: deleteRoom } = useFetch(`/api/rooms/${idx}`, "delete")

  try {
    if (!confirm("Дядь, подумой, точно хочешь удалить?")) {
      return
    }

    await deleteRoom()
    rooms.value.splice(idx - 1, 1)
  } catch (e) {
    console.error(e)
  }
}
</script>

<style lang="scss" scoped>
.rooms {
  display: flex;
  justify-content: space-evenly;
  flex-wrap: wrap;

  .room {
    max-width: 300px;
    //max-height: 300px;
    border: 1px solid var(--bs-gray-600);
    border-radius: 10px;
    padding: 3rem 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    margin-bottom: 2rem;
    transition: 0.2s;
    position: relative;

    & > * {
      pointer-events: none;
    }

    img {
      max-height: 280px;
    }

    &.dragging {
      opacity: 0.45;
      background-color: var(--bs-dark);
    }

    &.dropping {
      //opacity: 0.45;
      background-color: #333;
    }

    &.disabled {
      overflow: hidden;

      &::after {
        content: "";
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.6);
        pointer-events: none;
        z-index: 9999;
      }
    }

    &.success {
      border-color: var(--bs-success);
    }

    &.fail {
      border-color: var(--bs-danger);
    }

    pre {
      min-width: 265px;
      //min-height: 265px;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
    }

    :deep(p:last-of-type) {
      margin-bottom: 0;
    }

    &:hover {
      transform: translateY(-10px);
      box-shadow: 0 0 7px 7px rgba(0, 0, 0, 0.1);
      cursor: pointer;

      .delete {
        opacity: 1;
      }
    }

    .delete {
      pointer-events: auto;
      border-radius: 0.5rem;
      width: 40px;
      height: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: 0.2s;
      opacity: 0;
      position: relative;
      z-index: 999999999999;

      &:hover {
        background: rgba(0, 0, 0, 0.2);
      }
    }
  }
}
</style>
