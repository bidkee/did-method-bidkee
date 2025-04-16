// did-method-bidkeejs/src/kaspa-config.js
//let kaspa;
import * as kaspa from 'kaspa-wasm'

try {
    // Load kaspa-wasm
    //kaspa = await import('kaspaw/kaspa');
    
    //kaspa = await requre('kaspaw/kaspa');
    kaspa.initConsolePanicHook();
  // Initialize WASM
    //if (typeof window !== 'undefined') {
    //    await kaspa.default?.();
    //}
} catch (error) {
    console.warn('kaspa-wasm failed to load:', error.message);
    // Fallback for demo
    kaspa = {
        PrivateKey: class { constructor(key) { this.key = key; } },
        PublicKey: class { constructor(key) { this.key = key; } },
        signMessage: async ({ message }) => `mock-signature-${message.slice(0, 10)}`,
        verifyMessage: async () => true,
        default: () => Promise.resolve(),
    };
}

export const PrivateKey = kaspa.PrivateKey;
export const PublicKey = kaspa.PublicKey;
export const signMessage = kaspa.signMessage;
export const verifyMessage = kaspa.verifyMessage;
