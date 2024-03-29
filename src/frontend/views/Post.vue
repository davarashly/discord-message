<template>
  <div class="container">
    <div class="row">
      <div class="col">
        <template v-if="viewMode">
          <pre v-html="renderedPost" />
          <div class="row mx-auto" style="max-width: 500px">
            <div class="col">
              <img class="img-fluid mt-4" v-for="img in post.data.files" :src="img" />
            </div>
          </div>
        </template>
        <template v-else>
          <div class="form-check mb-3 d-flex align-items-center">
            <input class="form-check-input me-2 my-0" type="checkbox" v-model="post.active" :checked="post.active" id="flexCheckDefault" />
            <label class="form-check-label" for="flexCheckDefault"> Отправлять </label>
          </div>
          <input type="text" class="form-control mb-3" placeholder="ID канала" v-model="post.channelId" />
          <input type="text" class="form-control mb-4" :placeholder="store.userData?.discordToken" v-model="post.token" />
          <div class="form-floating">
            <textarea :disabled="isLoading1 || isLoading2" v-model="post.data.content" class="form-control text-white" placeholder="Сообщение поста" id="floatingTextarea" />
            <label for="floatingTextarea">Сообщение поста</label>
          </div>
          <input type="text" class="form-control mt-3" placeholder="Изображение" v-model="post.data.files![0]" />
          <input type="text" class="form-control mt-3" placeholder="Изображение" v-model="post.data.files![1]" />
          <input type="text" class="form-control mt-3" placeholder="Изображение" v-model="post.data.files![2]" />
        </template>
      </div>
    </div>
    <div class="row mt-4">
      <div class="col">
        <div class="d-flex justify-content-center">
          <button v-if="!viewMode" class="btn btn-secondary me-3" @click="reset()">Сбросить</button>
          <button class="btn btn-dark" :disabled="isLoading1 || isLoading2" @click="viewMode = !viewMode">
            {{ viewMode ? "Редактирование" : "Предпросмотр" }}
          </button>
        </div>
        <div class="d-flex justify-content-center mt-4">
          <button v-if="!viewMode" class="btn btn-primary me-3" :disabled="isLoading1 || isLoading2" @click="onSubmit()">
            Сохранить

            <div v-if="isLoading2" class="spinner-border ms-2" role="status">
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
import MarkdownIt from "markdown-it"
import MarkdownItEmoji from "markdown-it-emoji"
import { gemoji } from "gemoji"
import { useRoute, useRouter } from "vue-router"
import useFetch from "../compositions/useFetch"
import { IMessage, Status } from "../../core/interfaces/IMessage"
import { useStore } from "../store"

const route = useRoute()
const router = useRouter()
const store = useStore()

const viewMode = ref<boolean>(false)

const idx = route.params.idx as string

const discordEmojis = gemoji.reduce((acc, cur) => {
  if (cur.emoji) {
    cur.names.forEach((name) => {
      acc[name] = cur.emoji
    })
  }
  return acc
}, {})

const md = new MarkdownIt().use(MarkdownItEmoji, { defs: discordEmojis })

const { data, isLoading: isLoading1, fetch } = useFetch<{ post: IMessage }>(`/api/posts/${idx}`)

const originalPost = computed<IMessage | undefined>(() => data.value?.post)

const post = ref<IMessage>({
  active: false,
  channelId: "",
  data: {
    content: "",
    files: ["", ""]
  },
  status: "n/a" as Status,
  token: ""
})

watch(originalPost, () => {
  if (!!originalPost.value?.data) {
    post.value = { ...originalPost.value! }
  }
})

const reset = (skipConfirm = false) => {
  if (!skipConfirm && !confirm("Дядь, подумой, точно хочешь сбросить этот пост?")) {
    return
  }

  if (!!originalPost.value?.data) {
    post.value.data = { ...originalPost.value!.data }
    post.value.channelId = originalPost.value!.channelId
    post.value.active = originalPost.value!.active
    post.value.status = originalPost.value!.status
  } else {
    post.value.data = { content: "", files: [] }
    post.value.channelId = ""
    post.value.active = false
    post.value.status = "n/a"
  }
}

const renderedPost = computed<string>(() => md.render(post.value.data.content.trim()))

const { fetch: savePost, isLoading: isLoading2 } = useFetch(`/api/posts/${/^\d+$/g.test(idx) ? idx : ""}`, /^\d+$/g.test(idx) ? "put" : "post")

const onSubmit = async () => {
  try {
    await savePost({ post: post.value })
    await router.push("/")
  } catch (e) {
    console.error(e)
  }
}

onBeforeMount(async () => {
  try {
    if (/^\d+$/g.test(idx)) {
      await fetch()
      reset(true)
    }
  } catch (e) {
    if (e.message === "404") {
      await router.push("/")
    }
  }
})
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
