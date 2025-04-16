
// did-method-bidkeejs/src/bidkee.js
import { signMessage as signKaspa, verifyMessage as verifyKaspa } from './kaspa-config';
import { signMessage as signBtc, verifyMessage as verifyBtc } from './btc-config';
import { createHash } from 'crypto';

/**
 * Generates checkCode by hashing firstBlockchainAddress and equipmentID.
 * @param {string} firstBlockchainAddress - Blockchain address (e.g., kaspa:qqc3...).
 * @param {string} equipmentID - Unique identifier (e.g., ID-20250407-CN12345678).
 * @returns {string} SHA-256 hash (hex).
 */
export function generateCheckCode(firstBlockchainAddress, equipmentID) {
  if (!firstBlockchainAddress || !equipmentID) {
    throw new Error('Missing required fields: firstBlockchainAddress or equipmentID');
  }
  return createHash('sha256').update(`${firstBlockchainAddress}${equipmentID}`).digest('hex');
}

/**
 * Generates superordinateSignature (issuer authorization).
 * @param {string} checkCode - SHA-256 hash.
 * @param {Object} privateKey - Private key instance (Kaspa or BTC).
 * @param {string} chain - Blockchain type ('kaspa' or 'btc').
 * @returns {Promise<string>} Signature (hex).
 */
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

/**
 * Generates signatureMessage (holder responsibility).
 * @param {string} checkCode - SHA-256 hash.
 * @param {Object} privateKey - Private key instance.
 * @param {string} chain - Blockchain type ('kaspa' or 'btc').
 * @returns {Promise<string>} Signature (hex).
 */
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

/**
 * Verifies both signatures.
 * @param {Object} params - Verification parameters.
 * @param {string} params.checkCode - SHA-256 hash.
 * @param {string} params.superordinateSignature - Issuer signature.
 * @param {Object} params.superordinatePublicKey - Issuer public key.
 * @param {string} params.holderSignature - Holder signature.
 * @param {Object} params.holderPublicKey - Holder public key.
 * @param {string} params.chain - Blockchain type ('kaspa' or 'btc').
 * @returns {Promise<boolean>} True if both valid.
 */
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

/**
 * Generates a Bidkee DID.
 * @param {string} blockchainPrefix - Chain type (e.g., 'kaspa', 'btc').
 * @param {string} specificIdentifier - Unique identifier.
 * @returns {string} DID string.
 */
export function generateDid(blockchainPrefix, specificIdentifier) {
  return `did:bidkee:${blockchainPrefix}:${specificIdentifier}`;
}


