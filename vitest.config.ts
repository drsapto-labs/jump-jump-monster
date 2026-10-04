import { defineConfig } from 'vitest/config';

export default defineConfig({
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
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
