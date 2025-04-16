
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
    firstBlockchainAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    equipmentID: 'ID-20250407-CN12345678',
    issuerPrivKey: 'L2hfzPyVC1jWH7n2V4DsgLhk8MNmxT6TnSEmaf9ndzfG7cEUBS',
    issuerPubKey: '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
    holderPrivKey: 'Kx1tK8gYxQ5r1zK9zT4e9q1f9v1r1zK9zT4e9q1f9v1r1zK9zT4',
    holderPubKey: '02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5',
  },
};

async function runDemo(chain = 'kaspa') {
  console.log(`Running ${chain.toUpperCase()} demo:`);
  const data = identityData[chain];
  const PrivateKey = chain === 'kaspa' ? KaspaPrivateKey : BtcPrivateKey;
  const PublicKey = chain === 'kaspa' ? KaspaPublicKey : BtcPublicKey;

  // Step 1: Generate checkCode
  const checkCode = generateCheckCode(data.firstBlockchainAddress, data.equipmentID);
  console.log(`CheckCode: ${checkCode}`);

  // Step 2: Issuer signs
  const superSig = await signSuperordinate(checkCode, new PrivateKey(data.issuerPrivKey), chain);
  console.log(`Superordinate Signature: ${superSig}`);

  // Step 3: Holder signs
  const holderSig = await signHolder(checkCode, new PrivateKey(data.holderPrivKey), chain);
  console.log(`Holder Signature: ${holderSig}`);

  // Step 4: Verify signatures
  const isValid = await verifySignatures({
    checkCode,
    superordinateSignature: superSig,
    superordinatePublicKey: new PublicKey(data.issuerPubKey),
    holderSignature: holderSig,
    holderPublicKey: new PublicKey(data.holderPubKey),
    chain,
  });
  console.log(`Signatures Valid: ${isValid}`);

  // Step 5: Generate DID
  const did = generateDid(chain, checkCode.slice(0, 32));
  console.log(`DID: ${did}\n`);
}

runDemo('kaspa');
runDemo('btc');
