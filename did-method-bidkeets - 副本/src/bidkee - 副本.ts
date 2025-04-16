import { createHash, createSign, createVerify } from 'crypto';
import logger from './logger';
import { IdentityStructure, SignatureParams, VerifyParams } from './types';

export class Bidkee {
    static generateCheckCode(firstBlockchainAddress: string, equipmentID: string): string {
        logger.info('生成 checkCode', { firstBlockchainAddress, equipmentID });
        if (!firstBlockchainAddress || !equipmentID) {
            const error = new Error('缺少必填字段：firstBlockchainAddress 或 equipmentID');
            logger.error(error.message);
            throw error;
        }
        const checkCode = createHash('sha256')
            .update(`${firstBlockchainAddress}${equipmentID}`)
            .digest('hex');
        logger.info('checkCode 生成成功', { checkCode });
        return checkCode;
    }

    static async signSuperordinate({ message, privateKey }: SignatureParams): Promise<string> {
        logger.info('生成发行方签名', { message });
        if (!message || !privateKey) {
            const error = new Error('缺少 message 或 privateKey');
            logger.error(error.message);
            throw error;
        }
        try {
            const sign = createSign('ed25519');
            sign.update(Buffer.from(message));
            sign.end();
            const signature = sign.sign(Buffer.from(privateKey, 'hex'), 'hex');
            logger.info('发行方签名生成成功', { signature });
            return signature;
        } catch (error: any) {
            logger.error('发行方签名失败', { error: error.message });
            throw new Error(`发行方签名失败：${error.message}`);
        }
    }

    static async signHolder({ message, privateKey }: SignatureParams): Promise<string> {
        logger.info('生成持有者签名', { message });
        if (!message || !privateKey) {
            const error = new Error('缺少 message 或 privateKey');
            logger.error(error.message);
            throw error;
        }
        try {
            const sign = createSign('ed25519');
            sign.update(Buffer.from(message));
            sign.end();
            const signature = sign.sign(Buffer.from(privateKey, 'hex'), 'hex');
            logger.info('持有者签名生成成功', { signature });
            return signature;
        } catch (error: any) {
            logger.error('持有者签名失败', { error: error.message });
            throw new Error(`持有者签名失败：${error.message}`);
        }
    }

    static async verifySignatures({
        checkCode,
        superordinateSignature,
        superordinatePublicKey,
        holderSignature,
        holderPublicKey,
    }: VerifyParams): Promise<boolean> {
        logger.info('验证签名', { checkCode });
        if (!checkCode || !superordinateSignature || !superordinatePublicKey || !holderSignature || !holderPublicKey) {
            const error = new Error('缺少验证参数');
            logger.error(error.message);
            throw error;
        }
        try {
            const superVerify = createVerify('ed25519');
            superVerify.update(Buffer.from(checkCode));
            const superValid = superVerify.verify(Buffer.from(superordinatePublicKey, 'hex'), superordinateSignature, 'hex');
            logger.info('发行方签名验证', { valid: superValid });

            const holderVerify = createVerify('ed25519');
            holderVerify.update(Buffer.from(checkCode));
            const holderValid = holderVerify.verify(Buffer.from(holderPublicKey, 'hex'), holderSignature, 'hex');
            logger.info('持有者签名验证', { valid: holderValid });

            const isValid = superValid && holderValid;
            logger.info('签名验证结果', { isValid });
            return isValid;
        } catch (error: any) {
            logger.error('验证失败', { error: error.message });
            throw new Error(`验证失败：${error.message}`);
        }
    }

    static generateDid(blockchainPrefix: string, specificIdentifier: string): string {
        const did = `did:bidkee:${blockchainPrefix}:${specificIdentifier}`;
        logger.info('生成 DID', { did });
        return did;
    }

    static generateIdentityStructure({
        firstBlockchainAddress,
        equipmentID,
        superordinateSignature,
        superordinateBlockchainAddress,
        name,
        birthdate,
    }: {
        firstBlockchainAddress: string;
        equipmentID: string;
        superordinateSignature: string;
        superordinateBlockchainAddress?: string;
        name?: string;
        birthdate?: string;
    }): IdentityStructure {
        logger.info('生成身份结构', { firstBlockchainAddress, equipmentID });
        const checkCode = this.generateCheckCode(firstBlockchainAddress, equipmentID);
        const identityStructure = {
            firstBlockchainAddress,
            superordinateSignature,
            superordinateBlockchainAddress,
            checkCode,
            optionalFields: {
                equipmentID,
                permissionData: 'citizen-20250407',
                dynamicData: {
                    name,
                    birthdate,
                    timestamp: new Date().toISOString(),
                    sequenceNumber: 1,
                },
            },
        };
        logger.info('身份结构生成成功', { identityStructure });
        return identityStructure;
    }
}
