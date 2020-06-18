import TwitchClient from '../../../TwitchClient';
/** @private */
export interface HelixModeratorData {
    user_id: string;
    user_name: string;
}
/**
 * Information about the moderator status of a user.
 */
export default class HelixModerator {
    private readonly _data;
    /** @private */
    protected readonly _client: TwitchClient;
    /** @private */
    constructor(_data: HelixModeratorData, client: TwitchClient);
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
}
