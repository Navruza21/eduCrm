import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = env.VITE_API_URL || '/api/v1'
  // Absolute VITE_API_URL: proxy its path to its host. Relative: proxy /api to API_PROXY_TARGET.
  const remoteApi = /^https?:\/\//.test(apiUrl) ? new URL(apiUrl) : null

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
    server: {
      // Dev only: the app calls the API path on its own origin, Vite forwards it to the backend.
      proxy: {
        [remoteApi ? remoteApi.pathname.replace(/\/+$/, '') : '/api']: {
          target: remoteApi?.origin ?? (env.API_PROXY_TARGET || 'http://localhost:8000'),
          changeOrigin: true,
        },
      },
    },
  }
})
