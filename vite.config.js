import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  server: { open: true },
  preview: {
    // Railway sirve la app bajo *.up.railway.app (y dominios custom).
    // Sin esto, vite preview responde 403 "host not allowed".
    allowedHosts: ['.up.railway.app', 'localhost'],
  },
});
