import { Bidkee } from './bidkee';
import logger from './logger';
export async function runDemo() {
    logger.info('��ʼ Bidkee DID ���ݿ���ʾ');
    const data = {
        firstBlockchainAddress: 'kaspa:qqc3a2j95vhn9jlq9d87mexyg7dwc0lvnyvzwypgwk9hx00h44krvlhf85g4q',
        equipmentID: 'ID-20250407-CN12345678',
        issuerPrivKey: 'b7e151628aed2a6abf7158809cf4f3c762e7160f38b4da56a784d9045190cfef',
        issuerPubKey: 'dff1d77f2a671c5f36183726db2341be58feae1da2deced843240f7b502ba659',
        holderPrivKey: '1c7d1ec7a34603f48a8561cb76558f7c3e423a5f65e1e9f3c6e5b33ae9b6b5e1',
        holderPubKey: 'ff1d77f2a671c5f36183726db2341be58feae1da2deced843240f7b502ba6591',
        name: '����',
        birthdate: '1990-01-01',
    };
    const checkCode = Bidkee.generateCheckCode(data.firstBlockchainAddress, data.equipmentID);
    const superSig = await Bidkee.signSuperordinate({ message: checkCode, privateKey: data.issuerPrivKey });
    const holderSig = await Bidkee.signHolder({ message: checkCode, privateKey: data.holderPrivKey });
    const identityStructure = Bidkee.generateIdentityStructure({
        firstBlockchainAddress: data.firstBlockchainAddress,
        equipmentID: data.equipmentID,
        superordinateSignature: superSig,
        superordinateBlockchainAddress: 'kaspa:qqz3a2j95vhn9jlq9d87mexyg7dwc0lvnyvzwypgwk9hx00h44krvlhf85g4q',
        name: data.name,
        birthdate: data.birthdate,
    });
    const isValid = await Bidkee.verifySignatures({
        checkCode,
        superordinateSignature: superSig,
        superordinatePublicKey: data.issuerPubKey,
        holderSignature: holderSig,
        holderPublicKey: data.holderPubKey,
    });
    const did = Bidkee.generateDid('kaspa', checkCode.slice(0, 32));
    if (isValid) {
        logger.info(`���ݿ���֤ͨ�����û� ${data.name}��ȷ�ϺϷ����кͳ�����ռ��`, { did });
    }
    else {
        logger.info('���ݿ���֤ʧ�ܣ��ܾ�����');
    }
    const result = { checkCode, superordinateSignature: superSig, holderSignature: holderSig, identityStructure, isValid, did };
    logger.info('��ʾ���', { result });
    return result;
}
if (require.main === module) {
    runDemo()
        .then((result) => {
        console.log('=== Bidkee DID ���ݿ���ʾ ===');
        console.log(`CheckCode: ${result.checkCode}`);
        console.log(`���з�ǩ��: ${result.superordinateSignature.slice(0, 20)}...`);
        console.log(`������ǩ��: ${result.holderSignature.slice(0, 20)}...`);
        console.log('���ݽṹ:', JSON.stringify(result.identityStructure, null, 2));
        console.log(`ǩ����֤���: ${result.isValid ? 'ͨ��' : 'ʧ��'}`);
        console.log(`DID: ${result.did}`);
        console.log(result.isValid
            ? `���ݿ���֤ͨ�����û� ${result.identityStructure.optionalFields.dynamicData.name}��ȷ�ϺϷ����кͳ�����ռ�С�`
            : '���ݿ���֤ʧ�ܣ��ܾ����ʡ�');
    })
        .catch((error) => logger.error('CLI ��ʾʧ��', { error: error.message }));
}
