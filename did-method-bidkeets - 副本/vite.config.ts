import { defineConfig } from 'vite';
// @ts-expect-error ÈÆ¹ıÇ±ÔÚµÄ TS2305 ´íÎó
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