import vue from "@vitejs/plugin-vue"
import vueJsx from "@vitejs/plugin-vue-jsx"
import { defineConfig } from "vite"

export default defineConfig({
  build: {
    outDir: "../../build/frontend",
    emptyOutDir: true,
  },
  clearScreen: false,
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true,
      },
    },
  },
  plugins: [vue(), vueJsx()],
  publicDir: "public",
  root: "./src/frontend",
})
