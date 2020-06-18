import BaseAPI from '../BaseAPI';
import HelixBitsAPI from './Bits/HelixBitsAPI';
import HelixClipAPI from './Clip/HelixClipAPI';
import HelixExtensionsAPI from './Extensions/HelixExtensionsAPI';
import HelixGameAPI from './Game/HelixGameAPI';
import HelixModerationAPI from './Moderation/HelixModerationAPI';
import HelixStreamAPI from './Stream/HelixStreamAPI';
import HelixSubscriptionAPI from './Subscriptions/HelixSubscriptionAPI';
import HelixUserAPI from './User/HelixUserAPI';
import HelixVideoAPI from './Video/HelixVideoAPI';
import HelixWebHooksAPI from './WebHooks/HelixWebHooksAPI';
/**
 * Groups all API calls available in Helix a.k.a. the "New Twitch API".
 *
 * Can be accessed using {@TwitchClient#helix}.
 */
export default class HelixAPIGroup extends BaseAPI {
    /**
     * The Helix bits API methods.
     */
    get bits(): HelixBitsAPI;
    /**
     * The Helix clips API methods.
     */
    get clips(): HelixClipAPI;
    /**
     * The Helix extensions API methods.
     */
    get extensions(): HelixExtensionsAPI;
    /**
     * The Helix game API methods.
     */
    get games(): HelixGameAPI;
    /**
     * The Helix moderation API methods.
     */
    get moderation(): HelixModerationAPI;
    /**
     * The Helix stream API methods.
     */
    get streams(): HelixStreamAPI;
    /**
     * The Helix subscription API methods.
     */
    get subscriptions(): HelixSubscriptionAPI;
    /**
     * The Helix user API methods.
     */
    get users(): HelixUserAPI;
    /**
     * The Helix WebHook API methods.
     */
    get webHooks(): HelixWebHooksAPI;
    /**
     * The Helix video API methods.
     */
    get videos(): HelixVideoAPI;
}
