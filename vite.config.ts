import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  base: "/htmlmaker/",
  plugins: [vue()],
  esbuild: {
    pure: ["console.log", "console.debug", "console.info", "console.warn"],
  },
  server: {
    port: 5173,
  },
});
