import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
    resolve: {
        alias: {
            '@shared': path.resolve(__dirname, 'src/Shared')
        }
    },
    build: {
        lib: {
            entry: 'src/main/preload.ts',
            formats: ['cjs'],
        },
    },
})
