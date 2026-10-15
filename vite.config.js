import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'SkeletalQuest: Puzzle Rangka Manusia',
        short_name: 'SkeletalQuest',
        description: 'Susun Rangka, Kuasai Biologi!',
        theme_color: '#102b46',
        background_color: '#f4f7fb',
        display: 'standalone',
        start_url: '/',
        icons: [{ src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }]
      },
      workbox: { globPatterns: ['**/*.{js,css,html,svg,woff2}'] }
    })
  ],
  test: { environment: 'jsdom', setupFiles: './src/test/setup.js' }
})
