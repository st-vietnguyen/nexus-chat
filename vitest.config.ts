import { defineConfig } from 'vitest/config';
import svgr from 'vite-plugin-svgr';
import Path from 'path';

export default defineConfig({
  plugins: [svgr()],
  resolve: {
    alias: {
      '@app': Path.resolve(__dirname, './src/app'),
      '@config': Path.resolve(__dirname, './src/config'),
      '@stylesheet': Path.resolve(__dirname, './src/stylesheet'),
      '@shared': Path.resolve(__dirname, './src/app/shared'),
      '@core': Path.resolve(__dirname, './src/app/core'),
      '@assets': Path.resolve(__dirname, './src/assets'),
      '@libs': Path.resolve(__dirname, './src/app/libs'),
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
