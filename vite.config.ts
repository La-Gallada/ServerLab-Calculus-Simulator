import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Las fuentes se emiten como archivos: la CSP no necesita permitir `data:`.
    assetsInlineLimit: (filePath) => (/\.(woff2?|ttf)$/.test(filePath) ? false : undefined),
  },
});
