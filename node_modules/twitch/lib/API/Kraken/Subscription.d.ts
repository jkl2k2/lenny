import TwitchClient from '../../TwitchClient';
/** @private */
export interface SubscriptionData {
    _id: string;
    sub_plan: string;
    sub_plan_name: string;
    created_at: string;
}
/**
 * A subscription to a Twitch channel.
 */
export default class Subscription {
    protected _data: SubscriptionData;
    /** @private */
    protected readonly _client: TwitchClient;
    /** @private */
    constructor(/** @private */ _data: SubscriptionData, client: TwitchClient);
    /**
     * The ID of the subscription.
     */
    get id(): string;
    /**
     * The identifier of the subscription plan.
     */
    get subPlan(): string;
    /**
     * The name of the subscription plan.
     */
    get subPlanName(): string;
    /**
     * The date when the subscription was started.
     */
    get startDate(): Date;
}
