import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        lib: {
            entry: 'src/main/preload.ts',
            formats: ['cjs'],
        },
    },
    resolve: {
        alias: [
            { find: '@shared', replacement: '/src/shared' },
            { find: '@services', replacement: '/src/main/services' },
            { find: '@ports', replacement: '/src/main/services/ports' },
        ]
    }
})
