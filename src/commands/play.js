const {
    entersState,
    joinVoiceChannel,
    VoiceConnectionStatus,
} = require(`@discordjs/voice`);
const { Command } = require(`discord-akairo`);
const discord_js_1 = require(`discord.js`);
const MusicSubscription = require(`../modules/subscription`);
const Track = require(`../modules/track`);
const api = process.env.API1;
const YouTube = require(`simple-youtube-api`);
const youtube = new YouTube(api);

//#region Adapter
const adapters = new Map();
const trackedClients = new Set();
/**
 * Tracks a Discord.js client, listening to VOICE_SERVER_UPDATE and VOICE_STATE_UPDATE events.
 * @param client - The Discord.js Client to track
 */
function trackClient(client) {
    if (trackedClients.has(client)) return;
    trackedClients.add(client);
    client.ws.on(discord_js_1.Constants.WSEvents.VOICE_SERVER_UPDATE, (payload) => {
        var _a;
        (_a = adapters.get(payload.guild_id)) === null || _a === void 0 ? void 0 : _a.onVoiceServerUpdate(payload);
    });
    client.ws.on(discord_js_1.Constants.WSEvents.VOICE_STATE_UPDATE, (payload) => {
        var _a, _b;
        if (
            payload.guild_id &&
            payload.session_id &&
            payload.user_id === ((_a = client.user) === null || _a === void 0 ? void 0 : _a.id)
        ) {
            (_b = adapters.get(payload.guild_id)) === null || _b === void 0 ? void 0 : _b.onVoiceStateUpdate(payload);
        }
    });
}
const trackedGuilds = new Map();
function cleanupGuilds(shard) {
    var _a;
    const guilds = trackedGuilds.get(shard);
    if (guilds) {
        for (const guildID of guilds.values()) {
            (_a = adapters.get(guildID)) === null || _a === void 0 ? void 0 : _a.destroy();
        }
    }
}
function trackGuild(guild) {
    let guilds = trackedGuilds.get(guild.shard);
    if (!guilds) {
        const cleanup = () => cleanupGuilds(guild.shard);
        guild.shard.on('close', cleanup);
        guild.shard.on('destroyed', cleanup);
        guilds = new Set();
        trackedGuilds.set(guild.shard, guilds);
    }
    guilds.add(guild.id);
}
/**
 * Creates an adapter for a Voice Channel
 * @param channel - The channel to create the adapter for
 */
function createDiscordJSAdapter(channel) {
    return (methods) => {
        adapters.set(channel.guild.id, methods);
        trackClient(channel.client);
        trackGuild(channel.guild);
        return {
            sendPayload(data) {
                if (channel.guild.shard.status === discord_js_1.Constants.Status.READY) {
                    channel.guild.shard.send(data);
                    return true;
                }
                return false;
            },
            destroy() {
                return adapters.delete(channel.guild.id);
            },
        };
    };
}
//#endregion

class PlayCommand extends Command {
    constructor() {
        super(`play`, {
            aliases: [`play`, `p`],
            args: [
                {
                    id: `song`,
                    match: `content`
                }
            ],
            options: [
                {
                    name: 'song',
                    type: 'STRING',
                    description: 'URL or search terms',
                    required: true,
                }
            ],
            category: `music`,
            description: `Plays a song from YouTube`,
            channel: `guild`,
            slash: true
        });
    }

    exec(message, args) {
        message.reply(`Please use the slash command instead`);
    }
    async execSlash(message, args) {
        // Get subscription from message's guild
        let subscription = this.client.subscriptions.get(message.guild.id);

        await message.interaction.defer();

        // Get URL from args
        let url = ``;

        if (args.song.includes("watch?v=") || args.song.includes('youtu.be')) {
            url = args.song;
        } else {
            await youtube.searchVideos(args.song, 1)
                .then(async results => {
                    if (results[0]) {
                        url = results[0].url;
                    } else {
                        message.interaction.editReply({
                            embeds: [
                                new discord_js_1.MessageEmbed()
                                    .setDescription(`:information_source: YouTube could not find a video with that input`)
                                    .setColor(`#36393f`)
                            ]
                        });
                    }
                });
        }

        // If connection doesn't exist, and the user is in a voice channel, create a connection and a subscription
        if (!subscription && message.interaction.member.voice.channel) {
            const channel = message.member.voice.channel;
            subscription = new MusicSubscription(
                joinVoiceChannel({
                    channelId: channel.id,
                    guildId: channel.guild.id,
                    adapterCreator: createDiscordJSAdapter(channel),
                }),
            );
            subscription.voiceConnection.on(`error`, global.logger.warn);
            message.client.subscriptions.set(channel.guild.id, subscription);
        }

        // If no subscription, tell user to join a voice channel
        if (!subscription) {
            console.log(subscription);
            console.log(message.interaction.member.voice.channel);
            return await message.interaction.followUp(`You need to join a voice channel first!`);
        }

        // Make sure connection is ready before processing
        try {
            await entersState(subscription.voiceConnection, VoiceConnectionStatus.Ready, 20000);
        } catch (err) {
            global.logger.warn(err);
            return await message.interaction.followUp(`Failed to join voice channel within 20 seconds, please try again later.`);
        }

        try {
            // Create a Track from the user's input
            const track = await Track.from(url, {
                async onStart() {
                    message.interaction.followUp({
                        embeds: [
                            new discord_js_1.MessageEmbed()
                                .setAuthor(`▶️ Now playing`)
                                .setDescription(`**[${track.video.title}](${track.video.url})**\n[${track.video.channel.title}](${track.video.channel.url})`)
                                .setThumbnail(track.video.maxRes.url)
                                .setFooter(`Requested by ${message.interaction.user.username}`, message.interaction.user.avatarURL())
                                .setColor(`#36393f`)
                                .setTimestamp()
                        ]
                    }).catch(global.logger.warn);
                },
                onFinish() {
                    return;
                },
                onError(err) {
                    global.logger.warn(err);
                    message.interaction.followUp(`Failed to play: ${track.title}`).catch(global.logger.warn);
                }
            });

            // Queue track and reply with success message
            subscription.enqueue(track);
            await message.interaction.followUp({
                embeds: [
                    new discord_js_1.MessageEmbed()
                        .setAuthor(`➕ Queued`)
                        .setDescription(`**[${track.video.title}](${track.video.url})**\n[${track.video.channel.title}](${track.video.channel.url})`)
                        .setThumbnail(track.video.maxRes.url)
                        .setFooter(`Requested by ${message.interaction.user.username}`, message.interaction.user.avatarURL())
                        .setColor(`#36393f`)
                        .setTimestamp()
                ]
            }).catch(global.logger.warn);
        } catch (err) {
            global.logger.warn(err);
            await message.interaction.editReply(`Failed to play track`);
        }
    }
}

module.exports = PlayCommand;