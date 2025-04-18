import { IdentityStructure } from './types.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import winston from 'winston';

// ���� Winston ��־
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'C:\\Users\\Administrator\\AppData\\Local\\Temp\\visualstudio-js-debugger.txt' }),
        new winston.transports.Console()
    ]
});

// ��̬���� kaspa ģ��
let kaspa: any;
try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const wasmPath = path.resolve(__dirname, '../kaspa/kaspa_wasm_bg.wasm');

    // ��֤ WASM �ļ�����
    if (!fs.existsSync(wasmPath)) {
        throw new Error(`WASM file not found at: ${wasmPath}`);
    }

    // ��ȡ WASM ������
    const wasmBinary = fs.readFileSync(wasmPath);

    const kaspaModule = await import('../kaspa/kaspa.js');
    // ʹ�� initSync ��ʼ�� WASM
    kaspa = kaspaModule.initSync({ module: wasmBinary });
    if (kaspa.initConsolePanicHook) {
        kaspa.initConsolePanicHook();
        logger.info('Kaspa WASM initialized with console panic hook');
    } else {
        logger.warn('initConsolePanicHook not found in kaspa module');
    }
    logger.info('Kaspa module loaded', { signMessage: !!kaspa.signMessage, verifyMessage: !!kaspa.verifyMessage });
} catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    logger.error('Failed to load kaspa-wasm', { error: errorMessage, stack: errorStack });
}

export class Bidkee {
    static create(did: string): IdentityStructure {
        // �淶�� DID
        const normalizedDid = did.startsWith('kaspa:') ? `did:bidkee:${did}` : did;
        logger.info('Creating BID', { did: normalizedDid });

        if (kaspa && kaspa.PrivateKey && kaspa.signMessage) {
            try {
                // ʾ����Կ���ο� message.js��
                const issuerPrivateKey = new kaspa.PrivateKey('b7e151628aed2a6abf7158809cf4f3c762e7160f38b4da56a784d9045190cfef');
                const holderPrivateKey = new kaspa.PrivateKey('c71d239df9170b2b6a3080e7f675cd96bc832d428c7d6ea6bc656df3b75cdbf9');

                // ǩ�� DID
                const issuerSignature = kaspa.signMessage({ message: normalizedDid, privateKey: issuerPrivateKey });
                const holderSignature = kaspa.signMessage({ message: normalizedDid, privateKey: holderPrivateKey });

                logger.info('Signatures generated', {
                    issuerSignature: issuerSignature.slice(0, 10) + '...',
                    holderSignature: holderSignature.slice(0, 10) + '...'
                });

                return {
                    did: normalizedDid,
                    signatures: {
                        issuer: issuerSignature,
                        holder: holderSignature,
                    },
                    fields: {
                        static: {},
                        dynamic: {},
                    },
                };
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                const errorStack = error instanceof Error ? error.stack : undefined;
                logger.error('Signature generation failed', { error: errorMessage, stack: errorStack });
            }
        }

        // Fallback to hardcoded signatures
        logger.warn('Falling back to hardcoded signatures');
        return {
            did: normalizedDid,
            signatures: {
                issuer: 'sig1',
                holder: 'sig2',
            },
            fields: {
                static: {},
                dynamic: {},
            },
        };
    }

    static verify(bid: IdentityStructure): boolean {
        logger.info('Verifying BID', { did: bid.did });

        // ��֤ DID ��ʽ
        const isValidDid = bid.did.startsWith('did:bidkee:kaspa:') || bid.did.startsWith('kaspa:');
        if (!isValidDid) {
            logger.error('Invalid DID format', { did: bid.did });
            return false;
        }

        if (kaspa && kaspa.PublicKey && kaspa.verifyMessage) {
            try {
                // ʾ����Կ���ο� message.js��
                const issuerPublicKey = new kaspa.PublicKey('02dff1d77f2a671c5f36183726db2341be58feae1da2deced843240f7b502ba659');//kaspa:qr0lr4ml9fn3chekrqmjdkergxl93l4wrk3dankcgvjq776s9wn9jkdskewva
                const holderPublicKey = new kaspa.PublicKey('02dff1d77f2a671c5f36183726db2341be58feae1da2deced843240f7b502ba659');

                // ��֤ǩ��
                const issuerValid = kaspa.verifyMessage({
                    message: bid.did,
                    signature: bid.signatures.issuer,
                    publicKey: issuerPublicKey,
                });
                const holderValid = kaspa.verifyMessage({
                    message: bid.did,
                    signature: bid.signatures.holder,
                    publicKey: holderPublicKey,
                });

                logger.info('Signature verification result', { issuerValid, holderValid });
                return issuerValid && holderValid;
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                const errorStack = error instanceof Error ? error.stack : undefined;
                logger.error('Signature verification failed', { error: errorMessage, stack: errorStack });
            }
        }

        // Fallback to hardcoded verification
        logger.warn('Falling back to hardcoded verification');
        return !!bid.signatures.issuer && !!bid.signatures.holder;
    }
}
