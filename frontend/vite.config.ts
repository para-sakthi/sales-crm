import path from 'path'
import { defineConfig } from 'vitest/config'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    env: {
      VITE_API_URL: 'http://localhost:3000',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      thresholds: {
        lines: 80,
        branches: 75,
        functions: 80,
        statements: 80,
      },
      exclude: [
        'src/main.tsx',
        'src/env.ts',
        'src/mocks/**',
        'src/lib/**',
        'src/test/**',
        '**/*.d.ts',
      ],
    },
  },
})
