// Requires
const ytdl = require(`ytdl-core`);
const { MessageEmbed } = require(`discord.js`);

//#region sendDetails
const sendDetails = async (input, c) => {
    if (!input) {
        console.warn(`Failed to send info regarding song. Input undefined.`);
        return c.send(new MessageEmbed()
            .setDescription(`<:cross:729019052571492434> Failed to get info on currently playing song.`)
            .setColor(`#FF3838`));
    }

    if (input.getType() == "radio") {
        // Construct embed
        let musicEmbed = new MessageEmbed()
            .setAuthor(`Now playing`, await input.getChannelThumbnail())
            .setDescription(`**[${input.getTitle()}](${input.getURL()})**\n[${input.getChannelName()}](${input.getChannelURL()})\n\n\`Radio Station\``)
            .setThumbnail(input.getThumbnail())
            .setTimestamp()
            .setFooter(`Requested by ${input.getRequesterName()}`, input.getRequesterAvatar())
            .setColor(`#36393f`);
        // Send message
        c.send(musicEmbed);
        // Set last embed
        input.getRequester().guild.music.lastEmbed = musicEmbed;
    } else if (input.getType() == "livestream") {
        // Construct embed
        let musicEmbed = new MessageEmbed()
            .setAuthor(`Now playing`, await input.getChannelThumbnail())
            .setDescription(`**[${input.getTitle()}](${input.getURL()})**\n[${input.getChannelName()}](${input.getChannelURL()})\n\n\`YouTube Livestream\``)
            .setThumbnail(input.getThumbnail())
            .setTimestamp()
            .setFooter(`Requested by ${input.getRequesterName()}`, input.getRequesterAvatar())
            .setColor(`#36393f`);
        // Send message
        c.send(musicEmbed);
        // Set last embed
        input.getRequester().guild.music.lastEmbed = musicEmbed;
    } else {
        // Construct embed
        let musicEmbed = new MessageEmbed()
            .setAuthor(`Now playing`, await input.getChannelThumbnail())
            .setDescription(`**[${input.getTitle()}](${input.getURL()})**\n[${input.getChannelName()}](${input.getChannelURL()})\n\nLength: \`${await input.getLength()}\``)
            .setThumbnail(input.getThumbnail())
            .setTimestamp()
            .setFooter(`Requested by ${input.getRequesterName()}`, input.getRequesterAvatar())
            .setColor(`#36393f`);
        // Send message
        c.send(musicEmbed);
        // Set last embed
        input.getRequester().guild.music.lastEmbed = musicEmbed;
    }
};

//#endregion

//#region play
const play = async message => {
    console.debug(`Beginning play() command execution`);

    const client = message.client;

    const queue = message.guild.music.queue;

    if (queue == undefined) return console.debug("play() called, but queue undefined");
    if (queue[0] == undefined) return console.debug("play() called, but queue[0] is undefined");

    if (queue[0].getType() == "video" || queue[0].getType() == "livestream") {
        // If regular video

        console.debug(`Input is a regular video`);

        // Download YouTube video
        const input = ytdl(queue[0].getURL(), {
            filter: `audio`,
            quality: `highestaudio`,
            highWaterMark: 1 << 25
        });

        if (input) {
            console.debug(`YTDL output is NOT undefined`);
        } else {
            console.debug(`YTDL output IS undefined`);
        }

        // Set dispatcher
        message.guild.music.dispatcher = client.voice.connections.get(message.guild.id).play(input, { volume: message.guild.music.volume });

        // Mark server as playing music
        message.guild.music.playing = true;

        // If not repeating, send music details (avoids spam)
        if (!message.guild.music.repeat) sendDetails(queue[0], message.channel);

        // If playing a livestream, auto-reconnect using repeat
        if (queue[0].getType() == "livestream") {
            message.guild.music.repeat = true;
        }

    } else if (queue[0].getType() == "twitch") {
        // If Twitch

        // Dispatchers.set(message.guild.id, client.voice.connections.get(message.guild.id).playStream(queue.list[0].getURL()));

        // sendDetails(queue.list[0], message.channel);

    } else if (queue[0].getType() == "soundcloud") {
        // If SoundCloud

        console.debug(`Input is a SoundCloud song`);

        // Download SoundCloud song
        scdl.download(queue[0].getURL())
            .then(stream => {
                // If not repeating, send music details (avoids spam)
                if (!message.guild.music.repeat) sendDetails(queue[0] || message.guild.music.lastPlayed, message.channel);

                // Set dispatcher
                message.guild.music.dispatcher = client.voice.connections.get(message.guild.id).play(stream, { bitrate: 384, volume: message.guild.music.volume, passes: 5, fec: true });

                // Mark server as playing music
                message.guild.music.playing = true;
            });
    } else if (queue[0].getType() == "radio") {
        // If radio station

        console.debug(`Input is a radio station`);

        // Get stream URL
        const input = await iheart.streamURL(queue[0].getStation());

        // Set dispatcher
        message.guild.music.dispatcher = client.voice.connections.get(message.guild.id).play(input, { bitrate: 384, volume: message.guild.music.volume, passes: 5, fec: true });

        // Mark server as playing music
        message.guild.music.playing = true;

        // If not repeating, send music details (avoids spam)
        if (!message.guild.music.repeat) sendDetails(queue[0], message.channel);

        // Auto-reconnect to station using repeat
        message.guild.music.repeat = true;

    } else {
        return message.channel.send("Error assigning dispatcher, object at index 0 not of recognized type");
    }

    message.guild.music.lastPlayed = queue.shift();

    // Reset dispatcher stream delay
    client.voice.connections.get(message.guild.id).player.streamingData.pausedTime = 0;

    message.guild.music.dispatcher.on("close", async () => {
        console.debug(`Dispatcher fired "close" event`);

        /*
        // Add time playing to server stats
        const serverStats = client.stats.ensure(message.guild.id, client.stats.default);

        if (message.guild.music.dispatcher != undefined && message.guild.music.dispatcher.streamTime != undefined) {
            client.stats.set(message.guild.id, serverStats[`musicTime`] + message.guild.music.dispatcher.streamTime, `musicTime`);
        }
        */

        if (message.guild.music.repeat) {
            queue.unshift(message.guild.music.lastPlayed);
        }

        if (queue[0]) {
            console.debug(`queue[0] is ${queue[0].getTitle()}, calling play()`);
            message.guild.music.dispatcher = undefined;
            return await play(message);
        } else {
            console.log(`queue[0] NOT found, stopping and resetting playing`);
            message.guild.music.playing = false;
            message.guild.music.dispatcher = undefined;
        }
    });

    message.guild.music.dispatcher.on("finish", async () => {
        console.debug(`Dispatcher fired "finish" event (not being used)`);

        /*
        // Add time playing to server stats
        const serverStats = client.stats.ensure(message.guild.id, client.stats.default);

        if (message.guild.music.dispatcher != undefined && message.guild.music.dispatcher.streamTime != undefined) {
            client.stats.set(message.guild.id, serverStats[`musicTime`] + message.guild.music.dispatcher.streamTime, `musicTime`);
        }

        if (message.guild.music.repeat) {
            queue.unshift(message.guild.music.lastPlayed);
        }

        if (queue[0]) {
            console.debug(`queue[0] is ${queue[0].getTitle()}, calling play()`);
            message.guild.music.dispatcher = undefined;
            return await play(message);
        } else {
            console.log(`queue[0] NOT found, stopping and resetting playing`);
            message.guild.music.playing = false;
            message.guild.music.dispatcher = undefined;
        }
        */
    });

};

//#endregion

// Exports
exports.sendDetails = sendDetails;
exports.play = play;