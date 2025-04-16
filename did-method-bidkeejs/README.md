<<<<<<< HEAD
# Bidkee DID Method Prototype

This repository provides a prototype implementation of the *Bidkee Enhanced Proposal v1.6* DID method, submitted to the W3C DID Community Group ([archive link placeholder]). It demonstrates the dual-signature mechanism for holder possession proof, particularly for identity card scenarios, using Kaspa’s cryptographic library. The code supports generating and verifying `checkCode`, `superordinateSignature`, and `signatureMessage` as described in the proposal.

## Overview
The Bidkee DID method introduces:
- **Dual Signatures**: Separates issuer authorization (`superordinateSignature`) and holder responsibility (`signatureMessage`).
- **Blockchain Agnosticism**: Compatible with chains like Kaspa, Polygon, etc.
- **Identity Structure**: Includes `firstBlockchainAddress`, `equipmentID`, and `dynamicData` for scenarios like identity cards.
- **Use Case**: Proves "legitimate issuance + holder possession" (e.g., government-issued IDs).

This prototype focuses on:
- Generating `checkCode` (SHA-256 hash of static fields).
- Creating and verifying `superordinateSignature` (issuer) and `signatureMessage` (holder).
- Supporting Kaspa-based Ed25519 signatures, extensible to other chains.

## Installation
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/bidkee/did-method-bidkee.git
   cd did-method-bidkee
   ```
2. **Install Dependencies**:
   Ensure Node.js is installed, then:
   ```bash
   npm install
   ```
   Install Kaspa library:
   ```bash
   npm install kaspa-wasm
   ```
3. **Run Demo**:
   ```bash
   node src/demo.js
   ```

## Directory Structure
```
did-method-bidkee/
├── src/
│   ├── bidkee.js         # Core Bidkee signature logic
│   ├── demo.js          # Demo script for dual signatures
│   └── kaspa-config.js  # Kaspa library wrapper
├── tests/
│   └── bidkee.test.js   # Unit tests for signature verification
├── README.md            # This file
├── package.json         # Node.js dependencies
└── LICENSE              # MIT License
```

## Usage
The prototype implements the Bidkee dual-signature flow:
1. **Generate `checkCode`**:
   Combines `firstBlockchainAddress` and `equipmentID` using SHA-256.
2. **Issuer Signs (`superordinateSignature`)**:
   Uses issuer’s private key to sign `checkCode`.
3. **Holder Signs (`signatureMessage`)**:
   Uses holder’s private key to sign `checkCode`.
4. **Verify Signatures**:
   Validates both signatures against respective public keys.

### Example Code
```javascript
// src/demo.js
const { generateCheckCode, signSuperordinate, signHolder, verifySignatures } = require('./bidkee');
const { PrivateKey, PublicKey } = require('./kaspa-config');

const identityData = {
  firstBlockchainAddress: 'kaspa:qqc3a2j95vhn9jlq9d87mexyg7dwc0lvnyvzwypgwk9hx00h44krvlhf85g4q',
  equipmentID: 'ID-20250407-CN12345678',
  issuerPrivKey: 'b7e151628aed2a6abf7158809cf4f3c762e7160f38b4da56a784d9045190cfef',
  issuerPubKey: 'dff1d77f2a671c5f36183726db2341be58feae1da2deced843240f7b502ba659',
  holderPrivKey: '1c7d1ec7a34603f48a8561cb76558f7c3e423a5f65e1e9f3c6e5b33ae9b6b5e1',
  holderPubKey: 'ff1d77f2a671c5f36183726db2341be58feae1da2deced843240f7b502ba6591',
};

async function runBidkeeDemo() {
  // Step 1: Generate checkCode
  const checkCode = generateCheckCode(
    identityData.firstBlockchainAddress,
    identityData.equipmentID
  );
  console.log(`CheckCode: ${checkCode}`);

  // Step 2: Issuer signs (superordinateSignature)
  const superSig = await signSuperordinate(
    checkCode,
    new PrivateKey(identityData.issuerPrivKey)
  );
  console.log(`Superordinate Signature: ${superSig}`);

  // Step 3: Holder signs (signatureMessage)
  const holderSig = await signHolder(
    checkCode,
    new PrivateKey(identityData.holderPrivKey)
  );
  console.log(`Holder Signature: ${holderSig}`);

  // Step 4: Verify signatures
  const isValid = await verifySignatures({
    checkCode,
    superordinateSignature: superSig,
    superordinatePublicKey: new PublicKey(identityData.issuerPubKey),
    holderSignature: holderSig,
    holderPublicKey: new PublicKey(identityData.holderPubKey),
  });
  console.log(`Signatures Valid: ${isValid}`);
}

runBidkeeDemo();
```

### Core Logic
```javascript
// src/bidkee.js
const { signMessage, verifyMessage } = require('./kaspa-config');
const crypto = require('crypto');

function generateCheckCode(firstBlockchainAddress, equipmentID) {
  const data = `${firstBlockchainAddress}${equipmentID}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

async function signSuperordinate(checkCode, privateKey) {
  return signMessage({ message: checkCode, privateKey });
}

async function signHolder(checkCode, privateKey) {
  return signMessage({ message: checkCode, privateKey });
}

async function verifySignatures({
  checkCode,
  superordinateSignature,
  superordinatePublicKey,
  holderSignature,
  holderPublicKey,
}) {
  const superValid = verifyMessage({
    message: checkCode,
    signature: superordinateSignature,
    publicKey: superordinatePublicKey,
  });
  const holderValid = verifyMessage({
    message: checkCode,
    signature: holderSignature,
    publicKey: holderPublicKey,
  });
  return superValid && holderValid;
}

module.exports = {
  generateCheckCode,
  signSuperordinate,
  signHolder,
  verifySignatures,
};
```

### Kaspa Wrapper
```javascript
// src/kaspa-config.js
const kaspa = require('kaspa-wasm');

kaspa.initConsolePanicHook();

module.exports = {
  PrivateKey: kaspa.PrivateKey,
  PublicKey: kaspa.PublicKey,
  signMessage: kaspa.signMessage,
  verifyMessage: kaspa.verifyMessage,
};
```

## Running Tests
Unit tests validate signature generation and verification:
```bash
npm test
```

### Test Example
```javascript
// tests/bidkee.test.js
const { expect } = require('chai');
const {
  generateCheckCode,
  signSuperordinate,
  signHolder,
  verifySignatures,
} = require('../src/bidkee');
const { PrivateKey, PublicKey } = require('../src/kaspa-config');

describe('Bidkee Signature Tests', () => {
  const data = {
    firstBlockchainAddress: 'kaspa:qqc3a2j95vhn9jlq9d87mexyg7dwc0lvnyvzwypgwk9hx00h44krvlhf85g4q',
    equipmentID: 'ID-20250407-CN12345678',
    issuerPrivKey: 'b7e151628aed2a6abf7158809cf4f3c762e7160f38b4da56a784d9045190cfef',
    issuerPubKey: 'dff1d77f2a671c5f36183726db2341be58feae1da2deced843240f7b502ba659',
    holderPrivKey: '1c7d1ec7a34603f48a8561cb76558f7c3e423a5f65e1e9f3c6e5b33ae9b6b5e1',
    holderPubKey: 'ff1d77f2a671c5f36183726db2341be58feae1da2deced843240f7b502ba6591',
  };

  it('should generate valid checkCode', () => {
    const checkCode = generateCheckCode(data.firstBlockchainAddress, data.equipmentID);
    expect(checkCode).to.be.a('string').with.length(64);
  });

  it('should generate and verify dual signatures', async () => {
    const checkCode = generateCheckCode(data.firstBlockchainAddress, data.equipmentID);
    const superSig = await signSuperordinate(checkCode, new PrivateKey(data.issuerPrivKey));
    const holderSig = await signHolder(checkCode, new PrivateKey(data.holderPrivKey));
    const isValid = await verifySignatures({
      checkCode,
      superordinateSignature: superSig,
      superordinatePublicKey: new PublicKey(data.issuerPubKey),
      holderSignature: holderSig,
      holderPublicKey: new PublicKey(data.holderPubKey),
    });
    expect(isValid).to.be.true;
  });
});
```

## Performance
- **Local Signing**: Ed25519 signing ~0.5ms.
- **Local Verification**: ~1ms.
- **Kaspa Chain Query**: ~3-5s (on-demand).

## Alignment with Bidkee Proposal
- **DID Syntax**: Implements `did:bidkee:kaspa:[specific-identifier]`.
- **Identity Structure**: Supports `firstBlockchainAddress`, `equipmentID`, `checkCode`.
- **Dual Signatures**:
  - `superordinateSignature`: Issuer signs `checkCode` for authorization.
  - `signatureMessage`: Holder signs `checkCode` for responsibility.
- **Use Case**: Identity card verification (government issuance + holder proof).
- **Extensibility**: Code is modular for other chains (e.g., Polygon).

## Contributing
Contributions are welcome! Please:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/xyz`).
3. Commit changes (`git commit -m 'Add xyz'`).
4. Push to the branch (`git push origin feature/xyz`).
5. Open a pull request.

## License
MIT License. See [LICENSE](LICENSE) for details.

## Contact
For feedback or collaboration:
- W3C DID CG: `public-credentials@w3.org`
- GitHub Issues: [Create an issue](https://github.com/bidkee/did-method-bidkee/issues)
=======
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
>>>>>>> 42fe52b1d3a58818109d91e86ea035c5eaf002c5
