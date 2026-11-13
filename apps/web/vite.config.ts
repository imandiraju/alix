import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@alix/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
      '@alix/game-engine': path.resolve(__dirname, '../../packages/game-engine/src/index.ts'),
      '@alix/ui': path.resolve(__dirname, '../../packages/ui/src/index.ts'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
});
