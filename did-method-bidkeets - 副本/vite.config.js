import { defineConfig } from 'vite';
// @ts-expect-error 绕过潜在的 TS2305 错误
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
    },
    build: {
        outDir: 'dist/client',
    },
});