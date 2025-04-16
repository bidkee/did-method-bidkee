import { IdentityStructure, SignatureParams, VerifyParams } from './types';
export declare class Bidkee {
    static generateCheckCode(firstBlockchainAddress: string, equipmentID: string): string;
    static signSuperordinate({ message, privateKey }: SignatureParams): Promise<string>;
    static signHolder({ message, privateKey }: SignatureParams): Promise<string>;
    static verifySignatures({ checkCode, superordinateSignature, superordinatePublicKey, holderSignature, holderPublicKey, }: VerifyParams): Promise<boolean>;
    static generateDid(blockchainPrefix: string, specificIdentifier: string): string;
    static generateIdentityStructure({ firstBlockchainAddress, equipmentID, superordinateSignature, superordinateBlockchainAddress, name, birthdate, }: {
        firstBlockchainAddress: string;
        equipmentID: string;
        superordinateSignature: string;
        superordinateBlockchainAddress?: string;
        name?: string;
        birthdate?: string;
    }): IdentityStructure;
}
