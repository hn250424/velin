import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
	base: "",
	build: {
		outDir: "dist/renderer",
		rollupOptions: {
			input: path.resolve(__dirname, "index.html")
		},
		emptyOutDir: true,
	},
	resolve: {
		alias: {
			"@shared": path.resolve(__dirname, "src/shared"),
			"@services": path.resolve(__dirname, "src/main/services"),
			"@contracts": path.resolve(__dirname, "src/main/contracts"),
		},
	},
});
