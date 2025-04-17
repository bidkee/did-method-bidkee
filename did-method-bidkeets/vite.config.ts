import { defineConfig } from 'vite';
// @ts-expect-error �ƹ�Ǳ�ڵ� TS2305 ����
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