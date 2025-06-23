import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        lib: {
            entry: 'src/main/main.ts',
            formats: ['es'],
        },
    },
    resolve: {
        alias: [
            { find: '@shared', replacement: '/src/shared' },
            { find: '@services', replacement: '/src/main/services' },
            { find: '@contracts', replacement: '/src/main/contracts' },
        ]
    }
})
