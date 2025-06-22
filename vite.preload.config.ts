import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
    build: {
        lib: {
            entry: 'src/main/preload.ts',
            formats: ['cjs'],
        },
    },
    plugins: [tsconfigPaths()],
})
