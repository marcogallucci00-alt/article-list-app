import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Base path for GitHub Pages: https://marcogallucci00-alt.github.io/article-list-app/
  base: '/article-list-app/',
})
