import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@core': `${import.meta.dirname}/src/core`,
      '@input': `${import.meta.dirname}/src/input`,
      '@game': `${import.meta.dirname}/src/game`,
      '@ui': `${import.meta.dirname}/src/ui`,
      '@audio': `${import.meta.dirname}/src/audio`,
      '@utils': `${import.meta.dirname}/src/utils`,
    },
  },

  server: {
    headers: {
      // [AUDIT #6] COOP/COEP headers — diperlukan untuk SharedArrayBuffer
      // yang digunakan oleh MediaPipe WASM runtime di Safari
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },

  build: {
    target: 'es2022',
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        // Pisahkan MediaPipe ke chunk terpisah agar bisa di-cache independen
        // Vite 8 (Rolldown) membutuhkan fungsi, bukan object
        manualChunks: (id: string) => {
          if (id.includes('@mediapipe')) return 'mediapipe';
        },
      },
    },
  },
});
