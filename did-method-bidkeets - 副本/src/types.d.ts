export interface IdentityStructure {
    firstBlockchainAddress: string;
    superordinateSignature: string;
    superordinateBlockchainAddress?: string;
    checkCode: string;
    optionalFields: {
        equipmentID: string;
        permissionData?: string;
        dynamicData: {
            name?: string;
            birthdate?: string;
            timestamp: string;
            sequenceNumber: number;
        };
    };
}
export interface SignatureParams {
    message: string;
    privateKey: string;
}
export interface VerifyParams {
    checkCode: string;
    superordinateSignature: string;
    superordinatePublicKey: string;
    holderSignature: string;
    holderPublicKey: string;
}
export interface DemoResult {
    checkCode: string;
    superordinateSignature: string;
    holderSignature: string;
    identityStructure: IdentityStructure;
    isValid: boolean;
    did: string;
}
