import TwitchClient from '../TwitchClient';
/** @private */
export default class BaseAPI {
    protected readonly _client: TwitchClient;
    constructor(client: TwitchClient);
}
