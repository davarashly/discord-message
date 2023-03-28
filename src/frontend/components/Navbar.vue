<template>
  <nav class="navbar navbar-expand-md bg-dark navbar-dark">
    <div class="container-fluid">
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mx-auto mb-2 mb-lg-0">
          <li v-for="link in links" class="nav-item">
            <router-link class="nav-link" :exact="!!link.exact" :to="link.url">{{ link.text }}</router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script lang="ts" setup>
interface ILink {
  url: string
  text: string
  exact?: boolean
}

const links: ILink[] = [
  { url: "/", text: "Посты", exact: true },
  { url: "/settings", text: "Настройки" }
]
</script>
