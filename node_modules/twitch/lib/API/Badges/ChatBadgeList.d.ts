import TwitchClient from '../../TwitchClient';
import ChatBadgeSet, { ChatBadgeSetData } from './ChatBadgeSet';
/** @private */
export declare type ChatBadgeListData = Record<string, ChatBadgeSetData>;
/**
 * A list of badge sets.
 */
export default class ChatBadgeList {
    private readonly _data;
    /** @private */
    protected readonly _client: TwitchClient;
    /** @private */
    constructor(_data: ChatBadgeListData, client: TwitchClient);
    /**
     * Names of all badge sets in the list.
     */
    get badgeSetNames(): string[];
    /**
     * Gets a specific badge set by name.
     *
     * @param name The name of the badge set.
     */
    getBadgeSet(name: string): ChatBadgeSet;
    /** @private */
    _merge(additionalData: ChatBadgeList | ChatBadgeListData): ChatBadgeList;
}
