import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react()],
  define: {
    'process.env.API_KEY': JSON.stringify("AIzaSyAHQdhdd3pe8oD0tzKWJ2fi4DCVUHlxARY"),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
