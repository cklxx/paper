import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const githubPagesBase =
  process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "paper";

export default defineConfig(({ mode }) => ({
  base: mode === "github-pages" ? `/${githubPagesBase}/` : "/",
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 4173,
    proxy: {
      "/api": "http://localhost:8000",
    },
  },
}));
