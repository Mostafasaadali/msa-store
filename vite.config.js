import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // هذا السطر هو المسؤول عن توليد الكلاسات بدلاً من الـ CDN
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'MSA Store',
        short_name: 'MSA',
        description: 'متجرك المتكامل للحصول على بوردات التحكم والقطع الإلكترونية',
        theme_color: '#000000', // لون شريط الإشعارات
        background_color: '#000000',
        display: 'standalone', // لعرض الموقع كتطبيق بدون شريط متصفح
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})