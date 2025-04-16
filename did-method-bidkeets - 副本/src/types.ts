export interface IdentityStructure {
    did: string;
    signatures: {
        issuer: string;
        holder: string;
    };
    fields: {
        static: Record<string, any>;
        dynamic: Record<string, any>;
    };
}

export interface DemoResult {
    bid: IdentityStructure;
    isValid: boolean;
}