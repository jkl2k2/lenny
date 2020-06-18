import TwitchClient from '../../../TwitchClient';
export declare type ChatRoomRole = 'EVERYONE' | 'SUBSCRIBER' | 'MODERATOR';
/** @private */
export interface ChatRoomData {
    _id: string;
    owner_id: string;
    name: string;
    topic: string;
    is_previewable: boolean;
    minimum_allowed_role: ChatRoomRole;
}
export default class ChatRoom {
    private readonly _data;
    /** @private */
    protected readonly _client: TwitchClient;
    /** @private */
    constructor(_data: ChatRoomData, client: TwitchClient);
    /**
     * The ID of the chat room.
     */
    get id(): string;
    /**
     * The user ID of the chat room owner.
     */
    get ownerId(): string;
    /**
     * Retrieves the user data of the chat room owner.
     */
    getOwner(): Promise<import("../User/User").default>;
    /**
     * The name of the chat room.
     */
    get name(): string;
    /**
     * The topic of the chat room.
     */
    get topic(): string;
    /**
     * Whether the chat room is previewable.
     */
    get isPreviewable(): boolean;
    /**
     * The minimum role allowed to enter this chat room.
     */
    get minRole(): ChatRoomRole;
    /**
     * The name of the IRC channel that corresponds to this chat room.
     */
    get ircName(): string;
}
