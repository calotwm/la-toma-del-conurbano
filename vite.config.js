import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    open: true,
    // en dev, el server de Socket.IO corre aparte (npm run dev:server, puerto 8787);
    // esto hace que /socket.io funcione igual que en producción (mismo origen).
    proxy: {
      '/socket.io': { target: 'http://localhost:8787', ws: true },
    },
  },
  preview: {
    // Railway sirve la app bajo *.up.railway.app (y dominios custom).
    // Sin esto, vite preview responde 403 "host not allowed".
    allowedHosts: ['.up.railway.app', 'localhost'],
  },
});
