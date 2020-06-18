import AccessToken from '../API/AccessToken';
import AuthProvider from './AuthProvider';
/**
 * An auth provider that always returns the same initially given credentials.
 *
 * You are advised to roll your own auth provider that can handle scope upgrades,
 * or to plan ahead and supply only access tokens that account for all scopes
 * you will ever need.
 */
export default class StaticAuthProvider implements AuthProvider {
    private readonly _clientId;
    private _accessToken?;
    private _scopes?;
    /**
     * Creates a new auth provider with static credentials.
     *
     * You don't usually have to create this manually. You should use `TwitchClient.withCredentials` instead.
     *
     * @param clientId The client ID.
     * @param accessToken The access token to provide.
     *
     * You need to obtain one using one of the [Twitch OAuth flows](https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/).
     * @param scopes The scopes this token has.
     */
    constructor(clientId: string, accessToken?: string | AccessToken, scopes?: string[]);
    /**
     * Retrieves an access token.
     *
     * If the current access token does not have the requested scopes, this method throws.
     * This makes supplying an access token with the correct scopes from the beginning necessary.
     *
     * @param scopes The requested scopes.
     */
    getAccessToken(scopes?: string | string[]): Promise<AccessToken | null>;
    /** @private */
    setAccessToken(token: AccessToken): void;
    /**
     * The client ID.
     */
    get clientId(): string;
    /**
     * The scopes that are currently available using the access token.
     */
    get currentScopes(): string[];
}
