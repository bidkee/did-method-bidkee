// did-method-bidkeejs/src/bidkee.js
import { signMessage as signKaspa, verifyMessage as verifyKaspa } from './kaspa-config';
import { signMessage as signBtc, verifyMessage as verifyBtc } from './btc-config';

// SHA-256 for browser (Web Crypto) and Node.js (crypto)
async function sha256(message) {
    if (typeof window !== 'undefined' && window.crypto?.subtle) {
        // Browser: Web Crypto API
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
        return Array.from(new Uint8Array(hashBuffer))
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('');
    } else {
        // Node.js: crypto module
        const crypto = await import('crypto');
        return crypto.createHash('sha256').update(message).digest('hex');
    }
}

export async function generateCheckCode(firstBlockchainAddress, equipmentID) {
    if (!firstBlockchainAddress || !equipmentID) {
        throw new Error('Missing required fields: firstBlockchainAddress or equipmentID');
    }
    return sha256(`${firstBlockchainAddress}${equipmentID}`);
}

export async function signSuperordinate(checkCode, privateKey, chain = 'kaspa') {
    if (!checkCode || !privateKey) {
        throw new Error('Missing checkCode or privateKey');
    }
    try {
        return chain === 'kaspa'
            ? await signKaspa({ message: checkCode, privateKey })
            : await signBtc({ message: checkCode, privateKey });
    } catch (error) {
        throw new Error(`Superordinate signing failed: ${error.message}`);
    }
}

export async function signHolder(checkCode, privateKey, chain = 'kaspa') {
    if (!checkCode || !privateKey) {
        throw new Error('Missing checkCode or privateKey');
    }
    try {
        return chain === 'kaspa'
            ? await signKaspa({ message: checkCode, privateKey })
            : await signBtc({ message: checkCode, privateKey });
    } catch (error) {
        throw new Error(`Holder signing failed: ${error.message}`);
    }
}

export async function verifySignatures({
    checkCode,
    superordinateSignature,
    superordinatePublicKey,
    holderSignature,
    holderPublicKey,
    chain = 'kaspa',
}) {
    if (!checkCode || !superordinateSignature || !superordinatePublicKey || !holderSignature || !holderPublicKey) {
        throw new Error('Missing verification parameters');
    }
    try {
        const verify = chain === 'kaspa' ? verifyKaspa : verifyBtc;
        const superValid = await verify({
            message: checkCode,
            signature: superordinateSignature,
            publicKey: superordinatePublicKey,
        });
        const holderValid = await verify({
            message: checkCode,
            signature: holderSignature,
            publicKey: holderPublicKey,
        });
        return superValid && holderValid;
    } catch (error) {
        throw new Error(`Verification failed: ${error.message}`);
    }
}

export function generateDid(blockchainPrefix, specificIdentifier) {
    return `did:bidkee:${blockchainPrefix}:${specificIdentifier}`;
}
