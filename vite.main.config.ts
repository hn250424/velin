import { defineConfig } from "vite";

export default defineConfig({
	build: {
		lib: {
			entry: "src/main/main.ts",
			formats: ["es"],
		},
		// sourcemap: true
	},
	resolve: {
		alias: [
			{ find: "@main", replacement: "src/main" },
			{ find: "@shared", replacement: "/src/shared" },
			{ find: "@services", replacement: "/src/main/services" },
			{
				find: "@modules_contracts",
				replacement: "/src/main/modules/contracts",
			},
		],
	},
});
