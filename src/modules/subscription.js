const {
    AudioPlayerStatus,
    createAudioPlayer,
    entersState,
    VoiceConnectionDisconnectReason,
    VoiceConnectionStatus,
} = require(`@discordjs/voice`);

function wait(time) {
    return new Promise(resolve => setTimeout(resolve, time).unref());
}

function arrayShuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;

    while (0 !== currentIndex) {

        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

/**
 * A MusicSubscription exists for each active VoiceConnection. Each subscription has its own audio player and queue,
 * and it also attaches logic to the audio player and voice connection for error handling and reconnection logic.
 */
module.exports = class MusicSubscription {
    /**
     * @param voiceConnection The VoiceConnection this subscription is attached to.
     */
    constructor(voiceConnection) {
        this.voiceConnection = voiceConnection;
        this.audioPlayer = createAudioPlayer();
        this.queue = [];
        this.queueLock = false;
        this.readyLock = false;
        this.lastEmbed = null;

        this.voiceConnection.on(`stateChange`, async (_, newState) => {
            if (newState.status === VoiceConnectionStatus.Disconnected) {
                if (newState.reason === VoiceConnectionDisconnectReason.WebSocketClose && newState.closeCode == 4014) {
                    // Code 4014 means we should not make a manual reconnect attempt
                    try {
                        await entersState(this.voiceConnection, VoiceConnectionStatus.Connecting, 5000);
                        // Probably moved voice channel
                    } catch (err) {
                        console.log(`Destroying connection, probably removed from voice channel`);
                        this.voiceConnection.destroy();
                        // Probably removed from voice channel
                    }
                } else if (this.voiceConnection.rejoinAttempts < 5) {
                    // Recoverable disconnect
                    console.log(`Recoverable disconnect, reconnecting to voice channel`);
                    await wait((this.voiceConnection.rejoinAttempts + 1) * 5000);
                    this.voiceConnection.rejoin();
                } else {
                    // Unrecoverable disconnect, no more remaining attempts to reconnect, no choice but to destroy
                    console.log(`Unrecoverable disconnect, destroying voice connection`);
                    this.voiceConnection.destroy();
                }
            } else if (newState.status === VoiceConnectionStatus.Destroyed) {
                // When destroyed, stop the subscription
                console.log(`Voice connection destroyed, stopping subscription`);
                this.stop();
            } else if (!this.readyLock && (newState.status === VoiceConnectionStatus.Connecting || newState.status === VoiceConnectionStatus.Signalling)) {
                /*
                    In the Signalling or Connecting states, we set a 20 second time limit for the connection to become ready
                    before destroying the voice connection. This stops the voice connection permanently existing in one of these
                    states.
                */
                this.readyLock = true;
                try {
                    await entersState(this.voiceConnection, VoiceConnectionStatus.Ready, 20000);
                } catch (err) {
                    if (this.voiceConnectionl.state.status !== VoiceConnectionStatus.Destroyed) this.voiceConnection.destroy();
                } finally {
                    this.readyLock = false;
                }
            }
        });

        // Configure audio player
        this.audioPlayer.on(`stateChange`, (oldState, newState) => {
            if (newState.status === AudioPlayerStatus.Idle && oldState.status !== AudioPlayerStatus.Idle) {
                // Entered idle from non-idle state, need to play next track
                oldState.resource.metadata.onFinish();
                this.processQueue();
            } else if (newState.status === AudioPlayerStatus.Playing && oldState.status !== AudioPlayerStatus.Paused) {
                // Entered playing state, new track has started
                newState.resource.metadata.onStart();
            }
        });

        this.audioPlayer.on(`error`, (err) => {
            error.resource.metadata.onError(err);
        });

        voiceConnection.subscribe(this.audioPlayer);
    }

    /**
     * Adds a new Track to the queue.
     *
     * @param track The track to add to the queue
     */
    enqueue(track) {
        this.queue.push(track);
        this.processQueue();
    }

    /**
     * Sets the last music embed sent
     */
    setLastEmbed(lastEmbed) {
        this.lastEmbed = lastEmbed;
    }

    /**
     * Stop audio playback, empties queue
     */
    stop() {
        this.queueLock = true;
        this.queue = [];
        this.audioPlayer.stop(true);
    }

    /**
     * Clear out the queue, but don't stop playback
     */
    clearQueue() {
        this.queue = [];
    }

    /**
     * Shuffle the queue
     */
    shuffle() {
        this.queue = arrayShuffle(this.queue);
    }

    /**
     * Attempts to play a track from the queue
     */
    async processQueue() {
        // Return if queue is locked, empty, or audio player is already active
        if (this.queueLock || this.audioPlayer.state.status !== AudioPlayerStatus.Idle || this.queue.length === 0) return;

        // Lock queue for safety
        this.queueLock = true;

        // Get next track
        const nextTrack = this.queue.shift();
        try {
            console.log(`Playing ${nextTrack.title}`);
            // Convert Track to AudioResource
            const resource = await nextTrack.createAudioResource();
            this.audioPlayer.play(resource);
            this.queueLock = false;
        } catch (err) {
            console.log(`Playing track from queue failed.\nError: ${err}`);
            // On fail, try next item of queue instead
            nextTrack.onError(err);
            this.queueLock = false;
            return this.processQueue();
        }
    }
};