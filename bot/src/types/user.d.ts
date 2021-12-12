export interface UserDoc {
    createdAt: Date;
    pp: string;
    username: string;
    discriminator: string;
    tag: string;
    badges?: string[];
    coins?: number;
    reggeltcount?: number;
    reggeltemote?: string;
    uid?: string;
}
