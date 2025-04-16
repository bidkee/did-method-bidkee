// did-method-bidkeejs/vite.config.js
import { defineConfig } from 'vite';
import path from 'path'; // ÃÌº” path µº»Î

export default defineConfig({
    server: {
        port: 3000,
    },
    optimizeDeps: {
        include: ['kaspa-wasm', 'bitcoinjs-lib', 'tiny-secp256k1'],
        exclude: ['util', 'crypto'],
    },
    build: {
        commonjsOptions: {
            transformMixedEsModules: true,
        },
        rollupOptions: {
            external: ['util', 'crypto'],
        },
    },
    assetsInclude: ['**/*.wasm'],
    resolve: {
        alias: {
            util: false,
            //'kaspa-wasm': path.resolve(__dirname, 'node_modules/kaspa-wasm/kaspa.js'),
            'kaspa-wasm': path.resolve(__dirname, 'node_modules/kaspa-wasm/kaspa.js'),
        },
    },
});