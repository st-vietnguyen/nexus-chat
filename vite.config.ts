import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import Path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@app': Path.resolve(__dirname, './src/app'),
      '@config': Path.resolve(__dirname, './src/config'),
      '@stylesheet': Path.resolve(__dirname, './src/stylesheet'),
      '@shared': Path.resolve(__dirname, './src/app/shared'),
      '@core': Path.resolve(__dirname, './src/app/core')
    },
  },
});
