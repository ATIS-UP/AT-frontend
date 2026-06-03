import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/mocks/test-setup.ts'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify('http://localhost:5173'),
  },
});
