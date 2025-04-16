<<<<<<< HEAD
# Bidkee DID Method Prototype (Updated)

This repository hosts the prototype implementation of the *Bidkee Enhanced Proposal v1.6*, submitted to the W3C DID Community Group ([archive link placeholder]). It demonstrates the dual-signature mechanism for holder possession proof in identity card scenarios, supporting multiple blockchains (Kaspa and Bitcoin).

## Structure
- **`did-method-bidkeejs/`**: JavaScript sub-project with Kaspa and Bitcoin signature examples.
- **Future Sub-projects**: Planned for other languages (e.g., Python, Rust) as needed.

## Features
- **Dual Signatures**: Implements `superordinateSignature` (issuer) and `signatureMessage` (holder).
- **Multi-Chain Support**: Kaspa (Ed25519) and Bitcoin (Secp256k1).
- **Identity Structure**: Uses `firstBlockchainAddress`, `equipmentID`, `checkCode`.
- **Use Case**: Verifies "legitimate issuance + holder possession" for identity cards.
- **Frontend**: Vite-based interface for demo. 
=======
<<<<<<< HEAD
# Bidkee DID Method Prototype

This repository provides a prototype implementation of the *Bidkee Enhanced Proposal v1.6* DID method, submitted to the W3C DID Community Group ([archive link placeholder]). It demonstrates the dual-signature mechanism for holder possession proof, particularly for identity card scenarios, using Kaspa’s cryptographic library. The code supports generating and verifying `checkCode`, `superordinateSignature`, and `signatureMessage` as described in the proposal.
<<<<<<< HEAD
 
=======

>>>>>>> 2d48cfd5e914983a566a5df1296eee8897ab5426
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
>>>>>>> a4abf43f61f6d841ee05c319c769b10fa16f15f5

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/bidkee/did-method-bidkee.git
   cd did-method-bidkee/did-method-bidkeejs
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run demo:
   ```bash
   npm run dev    # Frontend demo
   node src/demo.js  # CLI demo
   ```

## Sub-Project: did-method-bidkeejs
### Files
- **public/favicon.ico**: Placeholder icon.
- **src/**:
  - `bidkee.js`: Core logic for `checkCode` and signatures.
  - `kaspa-config.js`: Kaspa Ed25519 wrapper.
  - `btc-config.js`: Bitcoin Secp256k1 wrapper.
  - `demo.js`: CLI demo for Kaspa and BTC.
  - `main.js`: Vite frontend entry.
- **.gitignore**: Ignores `node_modules`, `dist`, etc.
- **CHANGELOG.md**: Tracks updates.
- **README.md**: Sub-project details.
- **did-method-bidkeejs.esproj**: Project config.
- **eslint.config.js**: Linting rules.
- **index.html**: Frontend entry.
- **package.json**: Dependencies and scripts.
- **vite.config.js**: Vite build config.

### bidkee.js
```javascript
// did-method-bidkeejs/src/bidkee.js
import { signMessage as signKaspa, verifyMessage as verifyKaspa } from './kaspa-config';
import { signMessage as signBtc, verifyMessage as verifyBtc } from './btc-config';
import { createHash } from 'crypto';

export function generateCheckCode(firstBlockchainAddress, equipmentID) {
  if (!firstBlockchainAddress || !equipmentID) {
    throw new Error('Missing required fields');
  }
  return createHash('sha256').update(`${firstBlockchainAddress}${equipmentID}`).digest('hex');
}

export async function signSuperordinate(checkCode, privateKey, chain = 'kaspa') {
  if (!checkCode || !privateKey) throw new Error('Missing checkCode or privateKey');
  try {
    return chain === 'kaspa'
      ? await signKaspa({ message: checkCode, privateKey })
      : await signBtc({ message: checkCode, privateKey });
  } catch (error) {
    throw new Error(`Superordinate signing failed: ${error.message}`);
  }
}

export async function signHolder(checkCode, privateKey, chain = 'kaspa') {
  if (!checkCode || !privateKey) throw new Error('Missing checkCode or privateKey');
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
```

### kaspa-config.js
```javascript
// did-method-bidkeejs/src/kaspa-config.js
import kaspa from 'kaspa-wasm';

kaspa.initConsolePanicHook();

export const PrivateKey = kaspa.PrivateKey;
export const PublicKey = kaspa.PublicKey;
export const signMessage = kaspa.signMessage;
export const verifyMessage = kaspa.verifyMessage;
```

### btc-config.js
```javascript
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
```

### demo.js
```javascript
// did-method-bidkeejs/src/demo.js
import {
  generateCheckCode,
  signSuperordinate,
  signHolder,
  verifySignatures,
  generateDid,
} from './bidkee';
import { PrivateKey as KaspaPrivateKey, PublicKey as KaspaPublicKey } from './kaspa-config';
import { PrivateKey as BtcPrivateKey, PublicKey as BtcPublicKey } from './btc-config';

const identityData = {
  kaspa: {
    firstBlockchainAddress: 'kaspa:qqc3a2j95vhn9jlq9d87mexyg7dwc0lvnyvzwypgwk9hx00h44krvlhf85g4q',
    equipmentID: 'ID-20250407-CN12345678',
    issuerPrivKey: 'b7e151628aed2a6abf7158809cf4f3c762e7160f38b4da56a784d9045190cfef',
    issuerPubKey: 'dff1d77f2a671c5f36183726db2341be58feae1da2deced843240f7b502ba659',
    holderPrivKey: '1c7d1ec7a34603f48a8561cb76558f7c3e423a5f65e1e9f3c6e5b33ae9b6b5e1',
    holderPubKey: 'ff1d77f2a671c5f36183726db2341be58feae1da2deced843240f7b502ba6591',
  },
  btc: {
    firstBlockchainAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', // Satoshi's address
    equipmentID: 'ID-20250407-CN12345678',
    issuerPrivKey: 'L2hfzPyVC1jWH7n2V4DsgLhk8MNmxT6TnSEmaf9ndzfG7cEUBS', // Example WIF
    issuerPubKey: '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798', // Example
    holderPrivKey: 'Kx1tK8gYxQ5r1zK9zT4e9q1f9v1r1zK9zT4e9q1f9v1r1zK9zT4', // Example WIF
    holderPubKey: '02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5', // Example
  },
};

async function runDemo(chain = 'kaspa') {
  const data = identityData[chain];
  const PrivateKey = chain === 'kaspa' ? KaspaPrivateKey : BtcPrivateKey;
  const PublicKey = chain === 'kaspa' ? KaspaPublicKey : BtcPublicKey;

  // Generate checkCode
  const checkCode = generateCheckCode(data.firstBlockchainAddress, data.equipmentID);
  console.log(`${chain.toUpperCase()} CheckCode: ${checkCode}`);

  // Issuer signs
  const superSig = await signSuperordinate(checkCode, new PrivateKey(data.issuerPrivKey), chain);
  console.log(`${chain.toUpperCase()} Superordinate Signature: ${superSig}`);

  // Holder signs
  const holderSig = await signHolder(checkCode, new PrivateKey(data.holderPrivKey), chain);
  console.log(`${chain.toUpperCase()} Holder Signature: ${holderSig}`);

  // Verify signatures
  const isValid = await verifySignatures({
    checkCode,
    superordinateSignature: superSig,
    superordinatePublicKey: new PublicKey(data.issuerPubKey),
    holderSignature: holderSig,
    holderPublicKey: new PublicKey(data.holderPubKey),
    chain,
  });
  console.log(`${chain.toUpperCase()} Signatures Valid: ${isValid}`);

  // Generate DID
  const did = generateDid(chain, checkCode.slice(0, 32));
  console.log(`${chain.toUpperCase()} DID: ${did}`);
}

runDemo('kaspa');
runDemo('btc');
```

### main.js
```javascript
// did-method-bidkeejs/src/main.js
import {
  generateCheckCode,
  signSuperordinate,
  signHolder,
  verifySignatures,
  generateDid,
} from './bidkee';
import { PrivateKey, PublicKey } from './kaspa-config';

const output = document.createElement('pre');
document.body.appendChild(output);

async function demo() {
  const data = {
    firstBlockchainAddress: 'kaspa:qqc3a2j95vhn9jlq9d87mexyg7dwc0lvnyvzwypgwk9hx00h44krvlhf85g4q',
    equipmentID: 'ID-20250407-CN12345678',
    issuerPrivKey: 'b7e151628aed2a6abf7158809cf4f3c762e7160f38b4da56a784d9045190cfef',
    issuerPubKey: 'dff1d77f2a671c5f36183726db2341be58feae1da2deced843240f7b502ba659',
    holderPrivKey: '1c7d1ec7a34603f48a8561cb76558f7c3e423a5f65e1e9f3c6e5b33ae9b6b5e1',
    holderPubKey: 'ff1d77f2a671c5f36183726db2341be58feae1da2deced843240f7b502ba6591',
  };

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
  const did = generateDid('kaspa', checkCode.slice(0, 32));

  output.textContent = `
    CheckCode: ${checkCode}
    Superordinate Signature: ${superSig}
    Holder Signature: ${holderSig}
    Signatures Valid: ${isValid}
    DID: ${did}
  `;
}

demo();
```

### .gitignore
```
# did-method-bidkeejs/.gitignore
node_modules/
dist/
.env
```

### CHANGELOG.md
```
# did-method-bidkeejs/CHANGELOG.md
## [1.0.0] - 2025-04-16
- Initial release with Kaspa and Bitcoin dual-signature support.
- Implemented checkCode, superordinateSignature, signatureMessage.
- Added Vite frontend demo.
```

### README.md (Sub-project)
```
# did-method-bidkeejs/README.md
# Bidkee DID Method (JavaScript)

JavaScript implementation of the *Bidkee Enhanced Proposal v1.6* DID method, supporting Kaspa and Bitcoin signatures.

## Installation
```bash
cd did-method-bidkeejs
npm install
```

## Usage
- CLI demo:
  ```bash
  node src/demo.js
  ```
- Frontend demo:
  ```bash
  npm run dev
  ```

## Features
- Dual signatures for identity cards.
- Kaspa (Ed25519) and Bitcoin (Secp256k1) support.
- Generates `did:bidkee:[chain]:[identifier]`.

## License
MIT
```

### did-method-bidkeejs.esproj
```xml
<!-- did-method-bidkeejs/did-method-bidkeejs.esproj -->
<Project>
  <PropertyGroup>
    <Name>did-method-bidkeejs</Name>
    <Description>Bidkee DID Method JavaScript Prototype</Description>
  </PropertyGroup>
  <ItemGroup>
    <Compile Include="src/**/*.js" />
    <Content Include="public/**/*" />
    <Content Include="index.html" />
  </ItemGroup>
</Project>
```

### eslint.config.js
```javascript
// did-method-bidkeejs/eslint.config.js
export default [
  {
    files: ['src/**/*.js'],
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off',
    },
  },
];
```

### index.html
```html
<!-- did-method-bidkeejs/index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bidkee DID Demo</title>
</head>
<body>
  <h1>Bidkee Dual-Signature Demo</h1>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

### package.json
```json
{
  "name": "did-method-bidkeejs",
  "version": "1.0.0",
  "description": "Bidkee DID Method JavaScript Prototype",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "bitcoinjs-lib": "^6.1.0",
    "kaspa-wasm": "^0.1.0",
    "tiny-secp256k1": "^2.2.1"
  },
  "devDependencies": {
    "eslint": "^8.57.0",
    "vite": "^5.2.0"
  },
  "license": "MIT"
}
```

### vite.config.js
```javascript
// did-method-bidkeejs/vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
  },
});
```

### Root README.md
```
# did-method-bidkee/README.md
# Bidkee DID Method Prototype

Prototype for *Bidkee Enhanced Proposal v1.6* ([W3C DID CG](https://lists.w3.org/Archives/Public/public-credentials/2025Apr/)).

## Sub-projects
- **did-method-bidkeejs**: JavaScript implementation (Kaspa, Bitcoin).

## Setup
```bash
git clone https://github.com/bidkee/did-method-bidkee.git
cd did-method-bidkeejs
npm install
npm run dev
```

## License
MIT
```

### Root .gitignore
```
# did-method-bidkee/.gitignore
node_modules/
dist/
*.log
```

### LICENSE
```
# did-method-bidkee/LICENSE
MIT License

Copyright (c) 2025 Bidkee.com

Permission is hereby granted, free of charge, to any person obtaining a copy...
```

## Usage
- CLI: `node did-method-bidkeejs/src/demo.js` (outputs Kaspa and BTC signatures).
- Frontend: `cd did-method-bidkeejs && npm run dev` (displays Kaspa demo in browser).
- Output example:
  ```
  KASPA CheckCode: [hash]
  KASPA Superordinate Signature: [sig]
  KASPA Holder Signature: [sig]
  KASPA Signatures Valid: true
  KASPA DID: did:bidkee:kaspa:[identifier]
  BTC CheckCode: [hash]
  BTC Superordinate Signature: [sig]
  BTC Holder Signature: [sig]
  BTC Signatures Valid: true
  BTC DID: did:bidkee:btc:[identifier]
  ```

## Contributing
1. Fork and create a branch (`git checkout -b feature/xyz`).
2. Commit changes (`git commit -m 'Add xyz'`).
3. Push (`git push origin feature/xyz`).
4. Open a PR.

## Contact
<<<<<<< HEAD
- W3C: `public-credentials@w3.org`
- Issues: [GitHub Issues](https://github.com/bidkee/did-method-bidkee/issues)
=======
For feedback or collaboration:
- W3C DID CG: `public-credentials@w3.org`
- GitHub Issues: [Create an issue](https://github.com/bidkee/did-method-bidkee/issues)
<<<<<<< HEAD
=======
=======
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
>>>>>>> 42fe52b1d3a58818109d91e86ea035c5eaf002c5
>>>>>>> a4abf43f61f6d841ee05c319c769b10fa16f15f5
>>>>>>> 2d48cfd5e914983a566a5df1296eee8897ab5426
