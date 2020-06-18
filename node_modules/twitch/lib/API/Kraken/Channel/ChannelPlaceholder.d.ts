import { UserIdResolvable } from '../../../Toolkit/UserTools';
import TwitchClient from '../../../TwitchClient';
/** @private */
export interface ChannelPlaceholderData {
    _id: string;
}
/**
 * A placeholder for a channel.
 *
 * This is used for example when you only have retrieved user data, but not channel data.
 * This can do anything you can do with only a channel ID, as it's equivalent to the user ID.
 */
export default class ChannelPlaceholder {
    /** @private */
    protected readonly _client: TwitchClient;
    /** @private */
    protected _data: ChannelPlaceholderData;
    /** @private */
    constructor(id: string, client: TwitchClient);
    /** @private */
    get cacheKey(): string;
    /**
     * The ID of the channel.
     */
    get id(): string;
    /**
     * Retrieves the list of cheermotes you can use in the channel.
     */
    getCheermotes(): Promise<import("../Bits/CheermoteList").default>;
    /**
     * Retrieves the channel data.
     */
    getChannel(): Promise<import("./Channel").default>;
    /**
     * Retrieves the channel's stream data.
     */
    getStream(): Promise<import("../Stream/Stream").default | null>;
    /**
     * Retrieves the channel's followers.
     */
    getFollowers(): Promise<import("./ChannelFollow").default[]>;
    /**
     * Retrieves the channel's subscribers.
     */
    getSubscriptions(): Promise<import("./ChannelSubscription").default[]>;
    /**
     * Retrieves the subscription data for the given user to the channel.
     *
     * Throws if the channel doesn't have a subscription program or the user is not subscribed to it.
     *
     * This method requires access to the channel. If you only have access to the user,
     * use {@User#getSubscriptionTo} instead.
     *
     * @param user The user you want to get the subscription data for.
     */
    getSubscriptionBy(user: UserIdResolvable): Promise<import("./ChannelSubscription").default | null>;
    /**
     * Checks whether the given user is subscribed to the channel.
     *
     * @param user The user you want to check the subscription for.
     */
    hasSubscriber(user: UserIdResolvable): Promise<boolean>;
}
