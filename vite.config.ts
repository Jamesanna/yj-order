import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/yj-order/',
  server: {
    host: '0.0.0.0',
    port: 5173
  }
})