import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // ライブラリチャンクを分けて初回パース時間短縮 + キャッシュ効率化
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three/')) return 'three-core';
          if (id.includes('@react-three/') || id.includes('postprocessing/')) return 'r3f';
          if (id.includes('framer-motion')) return 'motion';
        },
      },
    },
    // 警告閾値を上げる（Three.js + R3F + postprocessing は本質的に大きいので）
    chunkSizeWarningLimit: 1200,
  },
})
