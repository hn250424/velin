import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        lib: {
            entry: 'src/main/preload.ts',
            formats: ['es'],
        },
    },
})
