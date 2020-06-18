import TwitchClient from '../../../TwitchClient';
interface UserChatInfoGlobalBadgeData {
    id: string;
    version: string;
}
/** @private */
export interface UserChatInfoData {
    _id: string;
    login: string;
    display_name: string;
    color: string;
    is_verified_bot: boolean;
    is_known_bot: boolean;
    badges: UserChatInfoGlobalBadgeData[];
}
/**
 * Information about a user's chat appearance and privileges.
 */
export default class UserChatInfo {
    private readonly _data;
    private readonly _client;
    /** @private */
    constructor(_data: UserChatInfoData, client: TwitchClient);
    /**
     * The ID of the user.
     */
    get userId(): string;
    /**
     * Retrieves more data about the user.
     */
    getUser(): Promise<import("./User").default>;
    /**
     * The name of the user.
     */
    get userName(): string;
    /**
     * The display name of the user.
     */
    get displayName(): string;
    /**
     * The color that the user appears in in chat.
     */
    get color(): string;
    /**
     * Whether the user is a known bot.
     */
    get isKnownBot(): boolean;
    /**
     * Whether the user is a verified bot.
     */
    get isVerifiedBot(): boolean;
    /**
     * Whether the user is at least a known bot (i.e. known or verified).
     */
    get isAtLeastKnownBot(): boolean;
    /**
     * Checks whether the user has access to a given global badge.
     *
     * @param id The ID of a badge.
     */
    hasBadge(id: string): boolean;
}
export {};
