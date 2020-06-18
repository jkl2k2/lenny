import TwitchClient from '../../../TwitchClient';
export interface HelixGameData {
    id: string;
    name: string;
    box_art_url: string;
}
/**
 * A game as displayed on Twitch.
 */
export default class HelixGame {
    private readonly _data;
    /** @private */
    protected readonly _client: TwitchClient;
    /** @private */
    constructor(_data: HelixGameData, client: TwitchClient);
    /**
     * The ID of the game.
     */
    get id(): string;
    /**
     * The name of the game.
     */
    get name(): string;
    /**
     * The URL of the box art of the game.
     */
    get boxArtUrl(): string;
}
