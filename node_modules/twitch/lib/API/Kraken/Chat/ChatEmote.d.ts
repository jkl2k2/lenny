import TwitchClient from '../../../TwitchClient';
/** @private */
export interface ChatEmoteData {
    code: string;
    emoticon_set: number;
    id: number;
}
/**
 * A chat emote.
 */
export default class ChatEmote {
    private readonly _data;
    /** @private */
    protected readonly _client: TwitchClient;
    /** @private */
    constructor(_data: ChatEmoteData, client: TwitchClient);
    /**
     * The emote ID.
     */
    get id(): number;
    /**
     * The emote code, i.e. how you write it in chat.
     */
    get code(): string;
    /**
     * The ID of the emote set.
     */
    get setId(): number;
}
