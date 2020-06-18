import HelixStreamMarker, { HelixStreamMarkerData } from './HelixStreamMarker';
import TwitchClient from '../../../TwitchClient';
export interface HelixStreamMarkerVideoData extends HelixStreamMarkerData {
    URL: string;
}
export default class HelixStreamMarkerWithVideo extends HelixStreamMarker {
    private readonly _videoId;
    /** @private */
    constructor(data: HelixStreamMarkerVideoData, _videoId: string, client: TwitchClient);
    /**
     * The URL of the video, which will start playing at the position of the stream marker.
     */
    get url(): string | undefined;
    /**
     * The ID of the video.
     */
    get videoId(): string;
    /**
     * Retrieves the video data of the video the marker was set in.
     */
    getVideo(): Promise<import("../Video/HelixVideo").default | null>;
}
