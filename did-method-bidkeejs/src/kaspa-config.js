

// did-method-bidkeejs/src/kaspa-config.js
import kaspa from 'kaspa-wasm';

kaspa.initConsolePanicHook();

export const PrivateKey = kaspa.PrivateKey;
export const PublicKey = kaspa.PublicKey;
export const signMessage = kaspa.signMessage;
export const verifyMessage = kaspa.verifyMessage;

