import TwitchClient from '../../../TwitchClient';
import ChatEmote, { ChatEmoteData } from './ChatEmote';
/**
 * A list of emotes.
 */
export default class ChatEmoteList {
    private readonly _data;
    /** @private */
    protected readonly _client: TwitchClient;
    /** @private */
    constructor(_data: ChatEmoteData[], client: TwitchClient);
    /**
     * A list of all emotes in the list.
     */
    get emotes(): ChatEmote[];
    /**
     * Gets all emotes from the list that are from a given emote set.
     *
     * @param setId
     */
    getAllFromSet(setId: number): ChatEmote[];
    /**
     * Finds a single emote by its ID.
     *
     * @param id
     */
    getById(id: number): ChatEmote | null;
}
