const {
    entersState,
    joinVoiceChannel,
    VoiceConnectionStatus,
} = require(`@discordjs/voice`);
const { Command } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);
const MusicSubscription = require(`../modules/subscription`);
const Track = require(`../modules/track`);
const api = process.env.API1;
const YouTube = require(`simple-youtube-api`);
const youtube = new YouTube(api);
const pretty = require(`pretty-ms`);

/*eslint class-methods-use-this: ["error", { "exceptMethods": ["exec", "execSlash"] }] */
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
            slashOptions: [
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
        return;
    }
    async execSlash(message, args) {
        // Get subscription from message's guild
        let subscription = this.client.subscriptions.get(message.guild.id);

        await message.interaction.defer();

        // If connection doesn't exist, and the user is in a voice channel, create a connection and a subscription
        if (!subscription && message.interaction.member.voice.channel) {
            const channel = message.member.voice.channel;
            subscription = new MusicSubscription(
                joinVoiceChannel({
                    channelId: channel.id,
                    guildId: channel.guild.id,
                    adapterCreator: channel.guild.voiceAdapterCreator,
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

        // Get URL from args
        let url = ``;

        if (args.song.value.includes("watch?v=") || args.song.value.includes('youtu.be')) {
            url = args.song.value;

            // Create a Track from the user's input
            const track = await Track.from(url, message.interaction.user, {
                async onStart() {
                    message.interaction.followUp({
                        embeds: [
                            new MessageEmbed()
                                .setAuthor(`▶️ Now playing`)
                                .setDescription(`**[${track.video.title}](${track.video.url})**\n[${track.video.channel.title}](${track.video.channel.url})\n\nLength: \`${track.getDuration()}\``)
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
            return await message.interaction.followUp({
                embeds: [
                    new MessageEmbed()
                        .setAuthor(`➕ Queued`)
                        .setDescription(`**[${track.video.title}](${track.video.url})**\n[${track.video.channel.title}](${track.video.channel.url})\n\nLength: \`${track.getDuration()}\``)
                        .setThumbnail(track.video.maxRes.url)
                        .setFooter(`Requested by ${message.interaction.user.username}`, message.interaction.user.avatarURL())
                        .setColor(`#36393f`)
                        .setTimestamp()
                ]
            }).catch(global.logger.warn);
        } else if (args.song.value.includes(`playlist`)) {
            // Get playlist from YouTube
            const playlist = await youtube.getPlaylist(args.song.value);

            // Get full list of songs from playlist
            const songs = await playlist.getVideos();

            for (const song of songs) {
                const track = await Track.from(song.url, message.interaction.user, {
                    async onStart() {
                        message.interaction.followUp({
                            embeds: [
                                new MessageEmbed()
                                    .setAuthor(`▶️ Now playing`)
                                    .setDescription(`**[${track.video.title}](${track.video.url})**\n[${track.video.channel.title}](${track.video.channel.url})\n\nLength: \`${track.getDuration()}\``)
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

                subscription.enqueue(track);
            }

            return await message.interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setAuthor(`➕ ${songs.length} songs queued`)
                        .setDescription(`**[${playlist.title}](${playlist.url})**\n[${playlist.channelTitle}](${playlist.channel.url})`)
                        .setThumbnail(playlist.thumbnails.default.url)
                        .setFooter(`Requested by ${message.author.username}`, message.author.avatarURL())
                        .setColor(`#36393f`)
                        .setTimestamp()
                ]
            });
        } else {
            await youtube.searchVideos(args.song.value, 1)
                .then(async results => {
                    if (results[0]) {
                        url = results[0].url;
                    } else {
                        message.interaction.editReply({
                            embeds: [
                                new MessageEmbed()
                                    .setDescription(`:information_source: YouTube could not find a video with that input`)
                                    .setColor(`#36393f`)
                            ]
                        });
                    }
                });

            // Create a Track from the user's input
            try {
                const track = await Track.from(url, message.interaction.user, {
                    async onStart() {
                        message.interaction.followUp({
                            embeds: [
                                new MessageEmbed()
                                    .setAuthor(`▶️ Now playing`)
                                    .setDescription(`**[${track.video.title}](${track.video.url})**\n[${track.video.channel.title}](${track.video.channel.url})\n\nLength: \`${track.getDuration()}\``)
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
                        new MessageEmbed()
                            .setAuthor(`➕ Queued`)
                            .setDescription(`**[${track.video.title}](${track.video.url})**\n[${track.video.channel.title}](${track.video.channel.url})\n\nLength: \`${track.getDuration()}\``)
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
}

module.exports = PlayCommand;