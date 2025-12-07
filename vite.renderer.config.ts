import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
	build: {
		rollupOptions: {
			input: resolve(process.cwd(), "index.html"),
		},
		emptyOutDir: true,
	},
	resolve: {
		alias: [
			{ find: "@shared", replacement: "/src/shared" },
			{ find: "@services", replacement: "/src/main/services" },
			{ find: "@contracts", replacement: "/src/main/contracts" },
		],
	},
});

// build: {
//     lib: {
//         entry: 'src/renderer/renderer.ts',
//         formats: ['es'],
//     },
// },
