
// did-method-bidkeejs/src/main.js
import {
    generateCheckCode,
    signSuperordinate,
    signHolder,
    verifySignatures,
    generateDid,
} from './bidkee';
import { PrivateKey as KaspaPrivateKey, PublicKey as KaspaPublicKey } from './kaspa-config';

const output = document.createElement('pre');
document.body.appendChild(output);

async function runWebDemo() {
    const data = {
        firstBlockchainAddress: 'kaspa:qqc3a2j95vhn9jlq9d87mexyg7dwc0lvnyvzwypgwk9hx00h44krvlhf85g4q',
        equipmentID: 'ID-20250407-CN12345678',
        issuerPrivKey: 'b7e151628aed2a6abf7158809cf4f3c762e7160f38b4da56a784d9045190cfef',
        issuerPubKey: 'dff1d77f2a671c5f36183726db2341be58feae1da2deced843240f7b502ba659',
        holderPrivKey: '1c7d1ec7a34603f48a8561cb76558f7c3e423a5f65e1e9f3c6e5b33ae9b6b5e1',
        holderPubKey: 'ff1d77f2a671c5f36183726db2341be58feae1da2deced843240f7b502ba6591',
    };

    try {
        const checkCode = generateCheckCode(data.firstBlockchainAddress, data.equipmentID);
        const superSig = await signSuperordinate(checkCode, new KaspaPrivateKey(data.issuerPrivKey), 'kaspa');
        const holderSig = await signHolder(checkCode, new KaspaPrivateKey(data.holderPrivKey), 'kaspa');
        const isValid = await verifySignatures({
            checkCode,
            superordinateSignature: superSig,
            superordinatePublicKey: new KaspaPublicKey(data.issuerPubKey),
            holderSignature: holderSig,
            holderPublicKey: new KaspaPublicKey(data.holderPubKey),
            chain: 'kaspa',
        });
        const did = generateDid('kaspa', checkCode.slice(0, 32));

        output.textContent = `
      Bidkee Dual-Signature Demo (Kaspa):
      CheckCode: ${checkCode}
      Superordinate Signature: ${superSig}
      Holder Signature: ${holderSig}
      Signatures Valid: ${isValid}
      DID: ${did}
    `;
    } catch (error) {
        output.textContent = `Error: ${error.message}`;
    }
}

runWebDemo();
