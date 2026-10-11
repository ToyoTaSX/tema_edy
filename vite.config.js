import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import render from './build/render.mjs';

export default defineConfig({
  base: './',
  plugins: [render()],
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    cssCodeSplit: false,
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        privacy: resolve(import.meta.dirname, 'privacy.html'),
        404: resolve(import.meta.dirname, '404.html'),
      },
    },
  },
});
