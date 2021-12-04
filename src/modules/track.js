const api = process.env.API1;
const YouTube = require(`simple-youtube-api`);
const youtube = new YouTube(api);
const { AudioResource, createAudioResource, demuxProbe } = require(`@discordjs/voice`);
const { exec } = require(`youtube-dl-exec`);
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
     * @param {Video} video The full video object returned by simple-youtube-api
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
        return new Promise((resolve, reject) => {
            const process = exec(
                this.url,
                {
                    o: '-',
                    q: '',
                    f: 'bestaudio/best',
                    r: '100K',
                },
                { stdio: ['ignore', 'pipe', 'ignore'] },
            );
            if (!process.stdout) {
                reject(new Error(`No output stream found for ${this.url}`));
                return;
            }
            const stream = process.stdout;
            const onError = (err) => {
                global.logger.warn(`youtube-dl-exec job killed. Error demuxing probe.`);
                if (!process.killed) process.kill();
                stream.resume();
                reject(err);
            };
            process.once(`spawn`, () => {
                demuxProbe(stream)
                    .then((probe) => resolve(createAudioResource(probe.stream, { metadata: this, inputType: probe.type })))
                    .catch(onError);
            });
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
    static async from(url, requester, methods) {
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

        const info = await youtube.getVideo(url);

        return new Track(info, requester, wrappedMethods.onStart, wrappedMethods.onFinish, wrappedMethods.onError);
    }

    /**
     * Get a formatted duration/length of the track
     * 
     * @return The formatted duration as a string
     */
    getDuration() {
        const total = (this.video.duration.seconds + (this.video.duration.minutes * 60) + (this.video.duration.hours * 60 * 60)) * 1000;
        return pretty(total, { colonNotation: true, secondsDecimalDigits: 0 });
    }
};