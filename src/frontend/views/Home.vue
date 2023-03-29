<template>
  <div class="container">
    <div class="row">
      <div class="col">
        <div class="posts">
          <router-link :to="`/posts/${idx + 1}`" v-for="(post, idx) in renderedPosts" class="post text-white text-decoration-none">
            <pre v-html="renderedPosts[idx]" />
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from "vue"
import { IMessage } from "../../core/interfaces/IMessage"
import MarkdownIt from "markdown-it"
import MarkdownItEmoji from "markdown-it-emoji"
import { gemoji } from "gemoji"

const discordEmojis = gemoji.reduce((acc, cur) => {
  if (cur.emoji) {
    cur.names.forEach((name) => {
      acc[name] = cur.emoji
    })
  }
  return acc
}, {})

const md = new MarkdownIt().use(MarkdownItEmoji, { defs: discordEmojis })

const posts = ref<IMessage[]>([])
const renderedPosts = computed<string[]>(() => posts.value.map((post) => md.render(post.data.content.trim())))

onMounted(async () => {
  try {
    posts.value = (await fetch("/api/posts", { method: "get", credentials: "include" }).then((r) => r.json())).posts
  } catch (e) {
    console.error(e)
  }
})
</script>

<style lang="scss" scoped>
.posts {
  display: flex;
  justify-content: space-evenly;
  flex-wrap: wrap;

  .post {
    max-width: 300px;
    max-height: 300px;
    border: 1px solid gray;
    border-radius: 10px;
    padding: 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    margin-bottom: 2rem;

    :deep(p) {
      margin-bottom: 0;
    }

    transition: 0.2s;

    &:hover {
      transform: translateY(-10px);
      box-shadow: 0 0 7px 7px rgba(0, 0, 0, 0.1);
      cursor: pointer;
    }
  }
}
</style>
