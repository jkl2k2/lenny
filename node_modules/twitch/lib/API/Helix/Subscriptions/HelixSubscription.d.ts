import TwitchClient from '../../../TwitchClient';
/** @private */
export interface HelixSubscriptionData {
    broadcaster_id: string;
    broadcaster_name: string;
    is_gift: boolean;
    plan_name: string;
    tier: string;
    user_id: string;
    user_name: string;
    message?: string;
}
/**
 * A (paid) subscription of a user to a broadcaster.
 */
export default class HelixSubscription {
    private readonly _data;
    /** @private */
    protected readonly _client: TwitchClient;
    /** @private */
    constructor(_data: HelixSubscriptionData, client: TwitchClient);
    /**
     * The user ID of the broadcaster.
     */
    get broadcasterId(): string;
    /**
     * The display name of the broadcaster.
     */
    get broadcasterDisplayName(): string;
    /**
     * Retrieves more data about the broadcaster.
     */
    getBroadcaster(): Promise<import("../User/HelixUser").default | null>;
    /**
     * Whether the subscription has been gifted by another user.
     */
    get isGift(): boolean;
    /**
     * The tier of the subscription.
     */
    get tier(): string;
    /**
     * The user ID of the subscribed user.
     */
    get userId(): string;
    /**
     * The display name of the subscribed user.
     */
    get userDisplayName(): string;
    /**
     * Retrieves more data about the subscribed user.
     */
    getUser(): Promise<import("../User/HelixUser").default | null>;
}
