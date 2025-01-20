import { defineConfig } from "tsup";

export default defineConfig({
    entry: [
        "./src/plugin-data.ts",
        "./src/plugin-php.ts"
    ],
    format: [
        "cjs"
    ],
    clean: true,
    shims: true,
    splitting: true
});