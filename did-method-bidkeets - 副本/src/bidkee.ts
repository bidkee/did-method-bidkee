import { IdentityStructure } from './types.js';

export class Bidkee {
    static create(did: string): IdentityStructure {
        // 规范化 DID：如果以 kaspa: 开头，添加 did:bidkee 前缀
        const normalizedDid = did.startsWith('kaspa:') ? `did:bidkee:${did}` : did;
        return {
            did: normalizedDid,
            signatures: {
                issuer: 'sig1', // 示例签名，实际需 Kaspa 签名
                holder: 'sig2',
            },
            fields: {
                static: {},
                dynamic: {},
            },
        };
    }

    static verify(bid: IdentityStructure): boolean {
        // 验证 DID 格式（接受 kaspa: 或 did:bidkee:kaspa:）
        const isValidDid = bid.did.startsWith('did:bidkee:kaspa:') || bid.did.startsWith('kaspa:');
        // 验证签名（示例逻辑，实际需检查签名有效性）
        const hasSignatures = !!bid.signatures.issuer && !!bid.signatures.holder;
        return isValidDid && hasSignatures;
    }
}
