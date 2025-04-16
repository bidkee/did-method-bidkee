// did-method-bidkeejs/src/btc-config.js
// Conditional imports for Node.js vs browser
let bitcoin, ecc;
if (typeof window === 'undefined') {
    // Node.js (CLI, e.g., demo.js)
    bitcoin = await import('bitcoinjs-lib');
    ecc = await import('tiny-secp256k1');
    bitcoin.initEccLib(ecc.default || ecc);
} else {
    // Browser (Vite, e.g., main.js)
    bitcoin = window.bitcoin; // Assume Vite resolves via package.json
    ecc = window.ecc;
    if (bitcoin && ecc) bitcoin.initEccLib(ecc);
}

export class PrivateKey {
    constructor(wif) {
        if (!bitcoin) throw new Error('bitcoinjs-lib not loaded');
        this.keyPair = bitcoin.ECPair.fromWIF(wif, bitcoin.networks.bitcoin);
    }
}

export class PublicKey {
    constructor(pubkey) {
        this.pubkey = Buffer.from(pubkey, 'hex');
    }
}

export async function signMessage({ message, privateKey }) {
    if (!bitcoin) throw new Error('bitcoinjs-lib not loaded');
    const messageHash = bitcoin.crypto.sha256(Buffer.from(message));
    const signature = privateKey.keyPair.sign(messageHash);
    return signature.toString('hex');
}

export async function verifyMessage({ message, signature, publicKey }) {
    if (!bitcoin) throw new Error('bitcoinjs-lib not loaded');
    const messageHash = bitcoin.crypto.sha256(Buffer.from(message));
    const sigBuffer = Buffer.from(signature, 'hex');
    try {
        const keyPair = bitcoin.ECPair.fromPublicKey(publicKey.pubkey);
        return keyPair.verify(messageHash, sigBuffer);
    } catch {
        return false;
    }
}