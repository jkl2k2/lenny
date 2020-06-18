import TwitchClient from '../../../TwitchClient';
/** @private */
export interface HelixBanData {
    user_id: string;
    user_name: string;
    expires_at: string;
}
/**
 * Information about the ban of a user.
 */
export default class HelixBan {
    private readonly _data;
    /** @private */
    protected readonly _client: TwitchClient;
    /** @private */
    constructor(_data: HelixBanData, client: TwitchClient);
    /**
     * The ID of the user.
     */
    get userId(): string;
    /**
     * Retrieves more data about the user.
     */
    getUser(): Promise<import("../User/HelixUser").default | null>;
    /**
     * The name of the user.
     */
    get userName(): string;
    /**
     * The date when the ban will expire; null for permanent bans.
     */
    get expiryDate(): Date | null;
}
