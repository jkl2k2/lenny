const { createAudioResource } = require(`@discordjs/voice`);
const play = require(`play-dl`);
const pretty = require(`pretty-ms`);
const amazon = require(`amazon-music-info`);

const noop = () => { };

/**
 * A Track represents information about a YouTube video (in this context) that can be added to a queue.
 * It contains the title and URL of the video, as well as functions onStart, onFinish, onError, that act
 * as callbacks that are triggered at certain points during the track's lifecycle.
 *
 * Rather than creating an AudioResource for each video immediately and then keeping those in a queue,
 * we use tracks as they don't pre-emptively load the videos. Instead, once a Track is taken from the
 * queue, it is converted into an AudioResource just in time for playback.
 */
module.exports = class Track {
    /**
     * Creates a new Track.
     * @param {Video} video The full video object returned by play-dl
     * @param {User} requester The user that requested this track
     * @param {function} onStart A function to call when the track is started.
     * @param {function} onFinish A function to call when the track is finished.
     * @param {function} onError A function to call when the track has an error.
     */
    constructor(video, requester, onStart, onFinish, onError) {
        this.video = video;
        this.requester = requester;
        this.title = video.title;
        this.url = video.url;
        this.onStart = onStart;
        this.onFinish = onFinish;
        this.onError = onError;
    }

    /**
     * Creates an AudioResource for the Track.
     */
    createAudioResource() {
        return new Promise(async (resolve, reject) => {
            if (this.url.includes(`spotify.com/`)) {
                return await play.search(`${this.video.title} by ${this.video.channel.name}`, { limit: 1 })
                    .then(async results => {
                        if (results[0]) {
                            let stream = await play.stream(results[0].url);

                            if (stream.stream) {
                                resolve(createAudioResource(stream.stream, {
                                    metadata: this,
                                    inputType: stream.type
                                }));
                            } else {
                                reject(new Error(`No stream acquirable for input ${this.url}`));
                            }
                        } else {
                            failedVideos++;
                        }
                    });
            } else if (this.url.includes(`amazon.com/`)) {
                return await play.search(`${this.video.title} by ${this.video.channel.name}`, { limit: 1 })
                    .then(async results => {
                        if (results[0]) {
                            let stream = await play.stream(results[0].url);

                            if (stream.stream) {
                                resolve(createAudioResource(stream.stream, {
                                    metadata: this,
                                    inputType: stream.type
                                }));
                            } else {
                                reject(new Error(`No stream acquirable for input ${this.url}`));
                            }
                        } else {
                            failedVideos++;
                        }
                    });
            }

            let stream = await play.stream(this.url);

            if (stream.stream) {
                resolve(createAudioResource(stream.stream, {
                    metadata: this,
                    inputType: stream.type
                }));
            } else {
                reject(new Error(`No stream acquirable for input ${this.url}`));
            }
        });
    }

    /**
     * Creates a Track from a video URL and lifecycle callback methods.
     *
     * @param url The URL of the video
     * @param requester The User that requested the song
     * @param methods Lifecycle callbacks
     * @return The created Track
     */
    static async from(input, requester, methods) {
        const wrappedMethods = {
            onStart() {
                wrappedMethods.onStart = noop;
                methods.onStart();
            },
            onFinish() {
                wrappedMethods.onFinish = noop;
                methods.onFinish();
            },
            onError(err) {
                wrappedMethods.onError = noop;
                methods.onError(err);
            }
        };

        let info;

        if (input.url && input.url.includes(`amazon.com/`)) {
            info = {
                title: input.name,
                url: input.url,
                channel: {
                    name: input.artist,
                    url: input.artist_url
                },
                durationInSec: input.duration,
                thumbnails: [
                    {
                        url: ``
                    }
                ]
            };
        } else if (input.includes(`soundcloud.com/`)) {
            const so_info = await play.soundcloud(input);

            const translatedInfo = {
                title: so_info.name,
                url: so_info.url,
                channel: {
                    name: so_info.user.name,
                    url: so_info.user.url
                },
                durationInSec: so_info.durationInSec,
                thumbnails: [
                    {
                        url: so_info.thumbnail
                    }
                ]
            };

            info = translatedInfo;
        } else if (input.includes(`spotify.com/`)) {
            const sp_info = await play.spotify(input);

            info = {
                title: sp_info.name,
                url: sp_info.url,
                channel: {
                    name: sp_info.artists[0].name,
                    url: sp_info.artists[0].url
                },
                durationInSec: sp_info.durationInSec,
                thumbnails: [
                    {
                        url: sp_info.thumbnail.url
                    }
                ]
            };
        } else {
            info = (await play.video_info(url)).video_details;
        }

        return new Track(info, requester, wrappedMethods.onStart, wrappedMethods.onFinish, wrappedMethods.onError);
    }

    /**
     * Get a formatted duration/length of the track
     * 
     * @return The formatted duration as a string
     */
    getDuration() {
        const total = (this.video.durationInSec * 1000);
        return pretty(total, { colonNotation: true, secondsDecimalDigits: 0 });
    }
};