//#region Requires
const index = require(`../index.js`);
const ytdl = require('ytdl-core');
const scdl = require(`soundcloud-downloader`);
const { MessageEmbed } = require(`discord.js`);
const logger = index.getLogger();
//#endregion

//#region sendDetails
const sendDetails = async (input, c) => {
    if (input.getType() == "livestream") {
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
const play = message => {
    const client = message.client;

    const queue = message.guild.music.queue;

    if (queue == undefined) return logger.debug("play() called, but queue undefined");
    if (queue[0] == undefined) return logger.debug("play() called, but queue[0] is undefined");

    if (queue[0].getType() == "video" || queue[0].getType() == "livestream") {
        // If regular video

        // Download YouTube video
        const input = ytdl(queue[0].getURL(), { quality: "highestaudio" });

        // Set dispatcher
        message.guild.music.dispatcher = client.voice.connections.get(message.guild.id).play(input, { bitrate: 384, volume: message.guild.music.volume, passes: 5, fec: true });

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

        // Download SoundCloud song
        scdl.download(queue[0].getURL())
            .then(stream => {
                // Set dispatcher
                message.guild.music.dispatcher = client.voice.connections.get(message.guild.id).play(stream, { bitrate: 384, volume: message.guild.music.volume, passes: 5, fec: true });

                // Mark server as playing music
                message.guild.music.playing = true;

                // If not repeating, send music details (avoids spam)
                if (!message.guild.music.repeat) sendDetails(queue[0], message.channel);
            });
    } else {
        return message.channel.send("Error assigning dispatcher, object at index 0 not of recognized type");
    }

    message.guild.music.lastPlayed = queue.shift();

    // Reset dispatcher stream delay
    client.voice.connections.get(message.guild.id).player.streamingData.pausedTime = 0;

    /*
    message.guild.music.dispatcher.on("close", () => {
        if (message.guild.music.repeat) {
            queue.unshift(message.guild.music.lastPlayed);
        }
        if (queue[0]) {
            return play(message);
        } else {
            message.guild.music.playing = false;
        }
    });
    */

    message.guild.music.dispatcher.on("finish", () => {
        // Add time playing to server stats
        const serverStats = client.stats.ensure(message.guild.id, client.stats.default);

        if (message.guild.dispatcher != undefined && message.guild.dispatcher.streamTime != undefined) {
            client.stats.set(message.guild.id, serverStats[`musicTime`] + message.guild.music.dispatcher.streamTime, `musicTime`);
        }

        if (message.guild.music.repeat) {
            queue.unshift(message.guild.music.lastPlayed);
        }
        if (queue[0]) {
            return play(message);
        } else {
            message.guild.music.playing = false;
        }
    });
};

//#endregion

//#region Exports
exports.sendDetails = sendDetails;
exports.play = play;
//#endregion