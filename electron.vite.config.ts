import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      target: "node22"
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      target: "node22"
    }
  },
  renderer: {
    resolve: {
      alias: {
        "@": resolve("src/renderer/src")
      }
    },
    plugins: [react(), tailwindcss()],
    build: {
      target: "chrome120"
    }
  }
});
