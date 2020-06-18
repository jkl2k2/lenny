import { UserIdResolvable } from '../../../Toolkit/UserTools';
import TwitchClient from '../../../TwitchClient';
/**
 * Filters for the follower request.
 */
export interface HelixFollowFilter {
    /**
     * The following user.
     */
    user?: UserIdResolvable;
    /**
     * The followed user.
     */
    followedUser?: UserIdResolvable;
}
/** @private */
export interface HelixFollowData {
    from_id: string;
    from_name: string;
    to_id: string;
    to_name: string;
    followed_at: string;
}
/**
 * A relation of a user following a broadcaster.
 */
export default class HelixFollow {
    protected _data: HelixFollowData;
    /** @private */
    protected readonly _client: TwitchClient;
    /** @private */
    constructor(/** @private */ _data: HelixFollowData, client: TwitchClient);
    /**
     * The user ID of the following user.
     */
    get userId(): string;
    /**
     * The display name of the following user.
     */
    get userDisplayName(): string;
    /**
     * Retrieves the data of the following user.
     */
    getUser(): Promise<import("./HelixUser").default | null>;
    /**
     * The user ID of the followed broadcaster.
     */
    get followedUserId(): string;
    /**
     * The display name of the followed user.
     */
    get followedUserDisplayName(): string;
    /**
     * Retrieves the data of the followed broadcaster.
     */
    getFollowedUser(): Promise<import("./HelixUser").default | null>;
    /**
     * The date when the user followed the broadcaster.
     */
    get followDate(): Date;
}
