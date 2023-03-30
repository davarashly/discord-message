import vue from "@vitejs/plugin-vue"
import vueJsx from "@vitejs/plugin-vue-jsx"
import { defineConfig } from "vite"

export default defineConfig({
  root: "./src/frontend",
  plugins: [vue(), vueJsx()],
  publicDir: "public",
  build: {
    outDir: "../../build/frontend",
    emptyOutDir: true
  },
  clearScreen: false
})
