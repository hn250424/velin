import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
    build: {
        lib: {
            entry: 'src/renderer/renderer.ts',
            formats: ['es'],
        },
    },
    plugins: [tsconfigPaths()],
})
