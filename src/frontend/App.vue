<template>
  <header>
    <Navbar />
  </header>
  <main class="p-3">
    <div class="container">
      <router-view />
    </div>
  </main>
  <footer class="p-3 bg-dark text-white text-center">Footer</footer>
</template>

<script lang="ts" setup>
import "bootstrap"
import Navbar from "./components/Navbar.vue"

</script>

<style lang="scss">
@import "bootstrap";

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: center;
}
</style>
