import TwitchClient from '../../../TwitchClient';
export interface HelixStreamMarkerData {
    id: string;
    created_at: string;
    description: string;
    position_seconds: number;
    URL?: string;
}
export default class HelixStreamMarker {
    protected readonly _data: HelixStreamMarkerData;
    /** @private */
    protected readonly _client: TwitchClient;
    /** @private */
    constructor(/** @private */ _data: HelixStreamMarkerData, client: TwitchClient);
    /**
     * The ID of the marker.
     */
    get id(): string;
    /**
     * The date and time when the marker was created.
     */
    get creationDate(): Date;
    /**
     * The description of the marker.
     */
    get description(): string;
    /**
     * The position in the stream when the marker was created, in seconds.
     */
    get positionInSeconds(): number;
}
