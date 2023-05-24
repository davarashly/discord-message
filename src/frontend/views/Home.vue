<template>
  <div class="container">
    <div class="row">
      <div class="col">
        <div v-if="isLoading" class="d-flex justify-content-center">
          <div class="spinner-border ms-2 text-secondary" role="status" style="scale: 5; --bs-spinner-border-width: 0.07em">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <div class="posts" v-else>
          <router-link :to="`/posts/${idx + 1}`" v-for="(post, idx) in renderedPosts" :class="{ disabled: !posts[idx].active, success: posts[idx].status === 'success', fail: posts[idx].status === 'fail' }" class="post text-white text-decoration-none">
            <div class="p-2 delete" style="position: absolute; top: 0.5rem; right: 0.5rem" @click.prevent="deletePostHandler(idx + 1)">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash-fill" viewBox="0 0 16 16">
                <path
                  d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z"
                />
              </svg>
            </div>
            <pre v-html="renderedPosts[idx]" />
            <div class="row" v-if="posts[idx].data.files?.some((f) => !!f)">
              <div class="col">
                <img class="img-fluid mt-4" v-for="img in posts[idx].data.files" :src="img" />
              </div>
            </div>
          </router-link>
          <router-link to="/posts/new" class="post text-white text-decoration-none">
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
import { computed, onBeforeMount, ref } from "vue"
import { IMessage } from "../../core/interfaces/IMessage"
import MarkdownIt from "markdown-it"
import MarkdownItEmoji from "markdown-it-emoji"
import { gemoji } from "gemoji"
import useFetch from "../compositions/useFetch"

const discordEmojis = gemoji.reduce((acc, cur) => {
  if (cur.emoji) {
    cur.names.forEach((name) => {
      acc[name] = cur.emoji
    })
  }
  return acc
}, {})

const md = new MarkdownIt().use(MarkdownItEmoji, { defs: discordEmojis })

const { fetch, isLoading, data } = useFetch<{ posts: IMessage[] }>("/api/posts")

const posts = ref<IMessage[]>([])
const renderedPosts = computed<string[]>(() => posts.value.map((post) => md.render(post.data.content.trim().slice(0, 200)) + "..."))

onBeforeMount(async () => {
  try {
    await fetch()

    posts.value = data.value?.posts || []
  } catch (e) {
    console.error(e)
  }
})

const deletePostHandler = async (idx: number) => {
  const { fetch: deletePost } = useFetch(`/api/posts/${idx}`, "delete")

  try {
    if (!confirm("Дядь, подумой, точно хочешь удалить?")) {
      return
    }

    await deletePost()
    posts.value.splice(idx - 1, 1)
  } catch (e) {
    console.error(e)
  }
}
</script>

<style lang="scss" scoped>
.posts {
  display: flex;
  justify-content: space-evenly;
  flex-wrap: wrap;

  .post {
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
