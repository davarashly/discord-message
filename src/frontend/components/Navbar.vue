<template>
  <nav class="navbar navbar-expand-md bg-dark navbar-dark">
    <div class="container-fluid">
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mx-auto mb-2 mb-lg-0">
          <li v-for="link in links" class="nav-item text-center">
            <router-link class="nav-link" :class="{ active: isRouteActive(link.url) }" :exact="!!link.exact" :to="link.url">{{ link.text }} </router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue"
import { useRoute } from "vue-router"

interface ILink {
  url: string
  text: string
  exact?: boolean
}

const route = useRoute()

const links: ILink[] = [
  { url: "/posts", text: "Посты" },
  { url: "/settings", text: "Настройки" }
]

const isRouteActive = (path: string) => computed(() => route.path.startsWith(path)).value
</script>
