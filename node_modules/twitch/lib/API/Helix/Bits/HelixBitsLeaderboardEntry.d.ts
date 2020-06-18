import TwitchClient from '../../../TwitchClient';
/** @private */
export interface HelixBitsLeaderboardEntryData {
    user_id: string;
    user_name: string;
    rank: number;
    score: number;
}
/**
 * A Bits leaderboard entry.
 */
export default class HelixBitsLeaderboardEntry {
    private readonly _data;
    /** @private */
    protected readonly _client: TwitchClient;
    /** @private */
    constructor(_data: HelixBitsLeaderboardEntryData, client: TwitchClient);
    /**
     * The ID of the user on the leaderboard.
     */
    get userId(): string;
    /**
     * The display name of the user on the leaderboard.
     */
    get userDisplayName(): string;
    /**
     * The position of the user on the leaderboard.
     */
    get rank(): number;
    /**
     * The amount of bits used in the given period of time.
     */
    get amount(): number;
    /**
     * Retrieves the user that's on this place on the leaderboard.
     */
    getUser(): Promise<import("../User/HelixUser").default | null>;
}
