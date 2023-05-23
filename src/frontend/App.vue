<template>
  <header>
    <Navbar />
  </header>
  <main class="p-3">
    <div class="container">
      <router-view />
    </div>
  </main>
  <footer class="p-3 bg-dark text-white text-center">Venom Motorz</footer>
</template>

<script lang="ts" setup>
import "bootstrap"
import Navbar from "./components/Navbar.vue"
</script>

<style lang="scss">
$primary: #6f2da8;
$primary: #826b20;

@import "bootstrap";

body {
  background: #444;
  color: white;
}

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

pre {
  max-width: 100%;
  overflow: unset;
  white-space: break-spaces;
  margin-bottom: 0;
}

input,
textarea {
  background-color: rgba(0, 0, 0, 0.3) !important;
  color: #fff !important;
}

.btn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 45.6px;

  &.btn-primary {
    color: #fff;
  }
}
</style>
