// src/bidkee.js

const { signMessage, verifyMessage } = require('./kaspa-config');
const crypto = require('crypto');

/**
 * Generates checkCode by hashing firstBlockchainAddress and equipmentID.
 * @param {string} firstBlockchainAddress - Blockchain address (e.g., kaspa:qqc3...).
 * @param {string} equipmentID - Unique identifier (e.g., ID-20250407-CN12345678).
 * @returns {string} SHA-256 hash (hex).
 */
function generateCheckCode(firstBlockchainAddress, equipmentID) {
  if (!firstBlockchainAddress || !equipmentID) {
    throw new Error('Missing required fields: firstBlockchainAddress or equipmentID');
  }
  const data = `${firstBlockchainAddress}${equipmentID}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Generates superordinateSignature (issuer authorization).
 * @param {string} checkCode - SHA-256 hash from generateCheckCode.
 * @param {Object} privateKey - Kaspa PrivateKey instance.
 * @returns {Promise<string>} Signature (hex).
 */
async function signSuperordinate(checkCode, privateKey) {
  if (!checkCode || !privateKey) {
    throw new Error('Missing checkCode or privateKey');
  }
  try {
    return await signMessage({ message: checkCode, privateKey });
  } catch (error) {
    throw new Error(`Superordinate signing failed: ${error.message}`);
  }
}

/**
 * Generates signatureMessage (holder responsibility).
 * @param {string} checkCode - SHA-256 hash from generateCheckCode.
 * @param {Object} privateKey - Kaspa PrivateKey instance.
 * @returns {Promise<string>} Signature (hex).
 */
async function signHolder(checkCode, privateKey) {
  if (!checkCode || !privateKey) {
    throw new Error('Missing checkCode or privateKey');
  }
  try {
    return await signMessage({ message: checkCode, privateKey });
  } catch (error) {
    throw new Error(`Holder signing failed: ${error.message}`);
  }
}

/**
 * Verifies both superordinateSignature and signatureMessage.
 * @param {Object} params - Verification parameters.
 * @param {string} params.checkCode - SHA-256 hash.
 * @param {string} params.superordinateSignature - Issuer signature.
 * @param {Object} params.superordinatePublicKey - Issuer public key.
 * @param {string} params.holderSignature - Holder signature.
 * @param {Object} params.holderPublicKey - Holder public key.
 * @returns {Promise<boolean>} True if both signatures are valid.
 */
async function verifySignatures({
  checkCode,
  superordinateSignature,
  superordinatePublicKey,
  holderSignature,
  holderPublicKey,
}) {
  if (!checkCode || !superordinateSignature || !superordinatePublicKey || !holderSignature || !holderPublicKey) {
    throw new Error('Missing verification parameters');
  }
  try {
    const superValid = await verifyMessage({
      message: checkCode,
      signature: superordinateSignature,
      publicKey: superordinatePublicKey,
    });
    const holderValid = await verifyMessage({
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
 * Generates a Bidkee DID (informational, for reference).
 * @param {string} blockchainPrefix - Blockchain type (e.g., 'kaspa').
 * @param {string} specificIdentifier - Unique identifier (e.g., checkCode).
 * @returns {string} DID string.
 */
function generateDid(blockchainPrefix, specificIdentifier) {
  return `did:bidkee:${blockchainPrefix}:${specificIdentifier}`;
}

module.exports = {
  generateCheckCode,
  signSuperordinate,
  signHolder,
  verifySignatures,
  generateDid,
};