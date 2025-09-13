/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
    },
    resolve: {
        alias: [
            { find: '@main', replacement: '/src/main'},
            { find: '@shared', replacement: '/src/shared' },
            { find: '@services', replacement: '/src/main/services' },
            { find: '@contracts', replacement: '/src/main/contracts' },
        ]
    }
})