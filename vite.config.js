import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // هذا السطر هو المسؤول عن توليد الكلاسات بدلاً من الـ CDN
  ],
})