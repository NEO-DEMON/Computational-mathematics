import path from 'path'
import { fileURLToPath } from 'url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Конфигурация сборщика Vite
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: path.join(__dirname, 'postcss.config.js'),
  },
})
