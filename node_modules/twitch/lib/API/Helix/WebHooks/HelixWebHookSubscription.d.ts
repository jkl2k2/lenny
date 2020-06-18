import TwitchClient from '../../../TwitchClient';
/** @private */
export interface HelixWebHookSubscriptionData {
    topic: string;
    callback: string;
    expires_at: string;
}
/**
 * A subscription to a Twitch WebHook.
 */
export default class HelixWebHookSubscription {
    private readonly _data;
    /** @private */
    protected readonly _client: TwitchClient;
    /** @private */
    constructor(_data: HelixWebHookSubscriptionData, client: TwitchClient);
    /**
     * The topic the WebHook is listening to.
     */
    get topicUrl(): string;
    /**
     * The URL that will be called for every subscribed event.
     */
    get callbackUrl(): string;
    /**
     * The time when the subscription will expire.
     */
    get expiryDate(): Date;
    /**
     * Unsubscribe from the WebHook.
     */
    unsubscribe(): Promise<void>;
}
