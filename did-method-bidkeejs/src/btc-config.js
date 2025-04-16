
// did-method-bidkeejs/src/btc-config.js
import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';

bitcoin.initEccLib(ecc);

export class PrivateKey {
  constructor(wif) {
    this.keyPair = bitcoin.ECPair.fromWIF(wif, bitcoin.networks.bitcoin);
  }
}

export class PublicKey {
  constructor(pubkey) {
    this.pubkey = Buffer.from(pubkey, 'hex');
  }
}

export async function signMessage({ message, privateKey }) {
  const messageHash = bitcoin.crypto.sha256(Buffer.from(message));
  const signature = privateKey.keyPair.sign(messageHash);
  return signature.toString('hex');
}

export async function verifyMessage({ message, signature, publicKey }) {
  const messageHash = bitcoin.crypto.sha256(Buffer.from(message));
  const sigBuffer = Buffer.from(signature, 'hex');
  try {
    const keyPair = bitcoin.ECPair.fromPublicKey(publicKey.pubkey);
    return keyPair.verify(messageHash, sigBuffer);
  } catch {
    return false;
  }
}
