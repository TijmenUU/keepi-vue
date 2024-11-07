import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: "../Keepi.Web/wwwroot/",
    emptyOutDir: true,
  },
  resolve: {
    alias: [
      {
        find: "@",
        replacement: path.resolve("./src"),
      },
      {
        find: "@test/",
        replacement: path.resolve("./test"),
      },
    ],
  },
});
