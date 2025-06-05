import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        lib: {
            entry: 'src/renderer/renderer.ts',
            formats: ['es'],
        },
    },
})
