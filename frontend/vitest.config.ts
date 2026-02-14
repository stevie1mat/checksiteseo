import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: './tests/setup.ts',
        include: ['tests/**/*.test.{ts,tsx}', 'lib/**/*.test.ts'],
        exclude: ['e2e/**', 'node_modules/**', '.next/**'],
        alias: {
            '@': path.resolve(__dirname, './'),
        },
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
        },
    },
})
