import { createHash, createSign, createVerify } from 'crypto';
import logger from './logger';
export class Bidkee {
    static generateCheckCode(firstBlockchainAddress, equipmentID) {
        logger.info('���� checkCode', { firstBlockchainAddress, equipmentID });
        if (!firstBlockchainAddress || !equipmentID) {
            const error = new Error('ȱ�ٱ����ֶΣ�firstBlockchainAddress �� equipmentID');
            logger.error(error.message);
            throw error;
        }
        const checkCode = createHash('sha256')
            .update(`${firstBlockchainAddress}${equipmentID}`)
            .digest('hex');
        logger.info('checkCode ���ɳɹ�', { checkCode });
        return checkCode;
    }
    static async signSuperordinate({ message, privateKey }) {
        logger.info('���ɷ��з�ǩ��', { message });
        if (!message || !privateKey) {
            const error = new Error('ȱ�� message �� privateKey');
            logger.error(error.message);
            throw error;
        }
        try {
            const sign = createSign('ed25519');
            sign.update(Buffer.from(message));
            sign.end();
            const signature = sign.sign(Buffer.from(privateKey, 'hex'), 'hex');
            logger.info('���з�ǩ�����ɳɹ�', { signature });
            return signature;
        }
        catch (error) {
            logger.error('���з�ǩ��ʧ��', { error: error.message });
            throw new Error(`���з�ǩ��ʧ�ܣ�${error.message}`);
        }
    }
    static async signHolder({ message, privateKey }) {
        logger.info('���ɳ�����ǩ��', { message });
        if (!message || !privateKey) {
            const error = new Error('ȱ�� message �� privateKey');
            logger.error(error.message);
            throw error;
        }
        try {
            const sign = createSign('ed25519');
            sign.update(Buffer.from(message));
            sign.end();
            const signature = sign.sign(Buffer.from(privateKey, 'hex'), 'hex');
            logger.info('������ǩ�����ɳɹ�', { signature });
            return signature;
        }
        catch (error) {
            logger.error('������ǩ��ʧ��', { error: error.message });
            throw new Error(`������ǩ��ʧ�ܣ�${error.message}`);
        }
    }
    static async verifySignatures({ checkCode, superordinateSignature, superordinatePublicKey, holderSignature, holderPublicKey, }) {
        logger.info('��֤ǩ��', { checkCode });
        if (!checkCode || !superordinateSignature || !superordinatePublicKey || !holderSignature || !holderPublicKey) {
            const error = new Error('ȱ����֤����');
            logger.error(error.message);
            throw error;
        }
        try {
            const superVerify = createVerify('ed25519');
            superVerify.update(Buffer.from(checkCode));
            const superValid = superVerify.verify(Buffer.from(superordinatePublicKey, 'hex'), superordinateSignature, 'hex');
            logger.info('���з�ǩ����֤', { valid: superValid });
            const holderVerify = createVerify('ed25519');
            holderVerify.update(Buffer.from(checkCode));
            const holderValid = holderVerify.verify(Buffer.from(holderPublicKey, 'hex'), holderSignature, 'hex');
            logger.info('������ǩ����֤', { valid: holderValid });
            const isValid = superValid && holderValid;
            logger.info('ǩ����֤���', { isValid });
            return isValid;
        }
        catch (error) {
            logger.error('��֤ʧ��', { error: error.message });
            throw new Error(`��֤ʧ�ܣ�${error.message}`);
        }
    }
    static generateDid(blockchainPrefix, specificIdentifier) {
        const did = `did:bidkee:${blockchainPrefix}:${specificIdentifier}`;
        logger.info('���� DID', { did });
        return did;
    }
    static generateIdentityStructure({ firstBlockchainAddress, equipmentID, superordinateSignature, superordinateBlockchainAddress, name, birthdate, }) {
        logger.info('�������ݽṹ', { firstBlockchainAddress, equipmentID });
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
        logger.info('���ݽṹ���ɳɹ�', { identityStructure });
        return identityStructure;
    }
}
