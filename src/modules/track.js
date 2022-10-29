/*jshint esversion: 11 */

const { createAudioResource } = require(`@discordjs/voice`);
const play = require(`play-dl2`);
const pretty = require(`pretty-ms`);

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
     * @param {Video} video The full video/song object returned by play-dl
     * @param {GuildMember} requester The user that requested this track
     * @param {function} onStart A function to call when the track is started.
     * @param {function} onFinish A function to call when the track is finished.
     * @param {function} onError A function to call when the track has an error.
     */
    constructor(video, requester, onStart, onFinish, onError) {
        this.video = video;
        this.requester = requester;
        this.timestamp = Date.now();
        this.seekable = true;
        this.seekTime = null;
        this.onStart = onStart;
        this.onFinish = onFinish;
        this.onError = onError;
    }

    /**
     * Creates an AudioResource for the Track.
     * 
     * @return {Promise<AudioResource>} An AudioResource containing a stream
     */
    createAudioResource() {
        return new Promise((resolve, reject) => {
            if (this.video.url.includes(`spotify.com/`)) {
                return play.search(`${this.video.title} by ${this.video.channel.name}`, { limit: 1 })
                    .then(results => {
                        if (results[0]) {
                            play.stream(results[0].url, { seek: 0.1 })
                                .then(stream => {
                                    resolve(createAudioResource(stream.stream, {
                                        metadata: this,
                                        inputType: stream.type
                                    }));
                                }, () => {
                                    // Seeking requires WebM/Opus stream format
                                    // In the event such a format is not available, it errors
                                    // So, we can handle this by streaming without the seek
                                    global.logger.warn(`createAudioResource: unable to seek because stream does not use WebM/Opus`);
                                    this.seekable = false;
                                    play.stream(results[0].url)
                                        .then(stream => {
                                            resolve(createAudioResource(stream.stream, {
                                                metadata: this,
                                                inputType: stream.type
                                            }));
                                        }, err => {
                                            reject(err);
                                        });
                                });
                        } else {
                            reject(new Error(`Could not find the song "${this.video.title} by ${this.video.channel.name}" on YouTube`));
                        }
                    });
            }

            // YouTube or SoundCloud, can stream directly
            play.stream(this.video.url, { seek: this.seekTime ?? 0.1 })
                .then(stream => {
                    // Mark SoundCloud and livestreams as not seekable
                    if (this.video.type === `soundcloud` || this.video.durationInSec === 0) this.seekable = false;
                    resolve(createAudioResource(stream.stream, {
                        metadata: this,
                        inputType: stream.type
                    }));
                }, () => {
                    // Seeking requires WebM/Opus stream format
                    // In the event such a format is not available, it errors
                    // So, we can handle this by streaming without the seek
                    global.logger.warn(`createAudioResource: unable to seek because stream does not use WebM/Opus`);
                    this.seekable = false;
                    play.stream(this.video.url)
                        .then(stream => {
                            resolve(createAudioResource(stream.stream, {
                                metadata: this,
                                inputType: stream.type
                            }));
                        }, err => {
                            reject(err);
                        });
                });
        });
    }

    /**
     * Creates a Track from a video URL and lifecycle callback methods.
     *
     * @param url The URL of the video
     * @param requester The GuildMember that requested the song
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

        if (typeof input === `object` && input.url.includes(`youtube.com/`)) {
            info = {
                type: `youtube`,
                title: input.title,
                url: input.url,
                channel: {
                    name: input.channel.name,
                    url: input.channel.url
                },
                durationInSec: input.durationInSec,
                thumbnails: [
                    {
                        url: input.thumbnails[0].url
                    }
                ]
            };
        } else if (typeof input === `object` && input.url.includes(`spotify.com/`)) {
            info = {
                type: `spotify`,
                title: input.name,
                url: input.url || `https://www.spotify.com/us/`,
                channel: {
                    name: input.artists[0].name,
                    url: input.artists[0].url || `https://www.spotify.com/us/`
                },
                durationInSec: input.durationInSec,
                thumbnails: [
                    {
                        url: input.thumbnail?.url
                    }
                ]
            };
        } else if (typeof input === `object` && input.url.includes(`soundcloud.com/`)) {
            info = {
                type: `soundcloud`,
                title: input.name,
                url: input.url,
                channel: {
                    name: input.user.name,
                    url: input.user.url
                },
                durationInSec: input.durationInSec,
                thumbnails: [
                    {
                        url: input.thumbnail
                    }
                ]
            };
        } else if (input.includes(`spotify.com/`)) {
            const sp_data = await play.spotify(input);

            info = {
                type: `spotify`,
                title: sp_data.name,
                url: sp_data.url || `https://www.spotify.com/us/`,
                channel: {
                    name: sp_data.artists[0].name,
                    url: sp_data.artists[0].url || `https://www.spotify.com/us/`
                },
                durationInSec: sp_data.durationInSec,
                thumbnails: [
                    {
                        url: sp_data.thumbnail?.url
                    }
                ]
            };
        } else if (input.includes(`soundcloud.com/`)) {
            const so_info = await play.soundcloud(input);

            info = {
                type: `soundcloud`,
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
        } else {
            info = (await play.video_info(input)).video_details;
            info.type = `unknown`;
        }

        return new Track(info, requester, wrappedMethods.onStart, wrappedMethods.onFinish, wrappedMethods.onError);
    }

    /**
     * Get a formatted duration/length of the track
     * 
     * @return The formatted duration as a string
     */
    getDuration() {
        if (this.video.type == `video` && this.video.live) {
            return `YouTube Livestream`;
        }

        const total = (this.video.durationInSec * 1000);
        return pretty(total, { colonNotation: true, secondsDecimalDigits: 0 });
    }
};