<template>
  <div class="container">
    <div class="row">
      <div class="col">
        <pre v-if="viewMode" v-html="renderedPost" />
        <div v-else>
          <div class="form-floating">
            <textarea :disabled="isLoading1 || isLoading2" v-model="post.data.content" class="form-control text-white" placeholder="Сообщение поста" id="floatingTextarea" />
            <label for="floatingTextarea">Сообщение поста</label>
          </div>

          <input type="text" class="form-control mt-3" placeholder="Изображение" />
          <input type="text" class="form-control mt-3" placeholder="Изображение" />
        </div>
      </div>
    </div>
    <div class="row mt-4">
      <div class="col">
        <div class="d-flex justify-content-center">
          <button v-if="!viewMode" class="btn btn-secondary me-3" @click="reset()">Сбросить</button>
          <button class="btn btn-secondary" @click="viewMode = !viewMode">
            {{ viewMode ? "Редактирование" : "Предпросмотр" }}
          </button>
        </div>
        <div class="d-flex justify-content-center mt-4">
          <button v-if="!viewMode" class="btn btn-dark me-3" @click="onSubmit()">Сохранить</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeMount, ref, watch } from "vue"
import { IMessage } from "../../core/interfaces/IMessage"
import MarkdownIt from "markdown-it"
import MarkdownItEmoji from "markdown-it-emoji"
import { gemoji } from "gemoji"
import { useRoute, useRouter } from "vue-router"
import useFetch from "../compositions/useFetch"

const route = useRoute()
const router = useRouter()

const viewMode = ref<boolean>(false)

const { idx } = route.params

const discordEmojis = gemoji.reduce((acc, cur) => {
  if (cur.emoji) {
    cur.names.forEach((name) => {
      acc[name] = cur.emoji
    })
  }
  return acc
}, {})

const md = new MarkdownIt().use(MarkdownItEmoji, { defs: discordEmojis })

const { data, isLoading: isLoading1, fetch } = useFetch<{ post: IMessage }>(`/api/posts/${+idx - 1}`)

const originalPost = computed<IMessage | undefined>(() => data.value?.post)

const post = ref<IMessage>({
  channelId: "",
  data: {
    content: "",
    files: [""]
  }
})

watch(originalPost, () => {
  if (!!originalPost.value?.data) {
    post.value.data = { ...originalPost.value!.data }
    post.value.channelId = originalPost.value!.channelId
  }
})

const reset = () => {
  if (!!originalPost.value?.data) {
    post.value.data = { ...originalPost.value!.data }
    post.value.channelId = originalPost.value!.channelId
  }
}

const renderedPost = computed<string>(() => md.render(post.value.data.content.trim()))

const { fetch: savePost, isLoading: isLoading2 } = useFetch(`/api/posts/${+idx - 1}`, "post", { post: post.value })

const onSubmit = async () => {
  try {
    await savePost()
  } catch (e) {
    console.error(e)
  }
}

onBeforeMount(async () => {
  try {
    await fetch()
    reset()
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

input,
textarea {
  background: rgba(0, 0, 0, 0.3) !important;
  color: #fff !important;
}

textarea {
  min-height: 58vh;

  @media (min-width: 768px) {
    min-height: 250px;
  }
}
</style>
