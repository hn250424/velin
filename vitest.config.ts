import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
    },
    resolve: {
        alias: [
            { find: '@shared', replacement: '/src/shared' },
            { find: '@services', replacement: '/src/main/services' },
            { find: '@contracts', replacement: '/src/main/contracts' },
        ]
    }
})