const {
    entersState,
    joinVoiceChannel,
    VoiceConnectionStatus,
} = require(`@discordjs/voice`);
const { Command } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);
const MusicSubscription = require(`../modules/subscription`);
const Track = require(`../modules/track`);
const play = require(`play-dl`);

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
            slash: true,
            slashOptions: [
                {
                    name: 'song',
                    type: 'STRING',
                    description: 'YouTube URL or search terms',
                    required: true,
                }
            ],
            category: `music`,
            description: `Plays a song from YouTube`,
            channel: `guild`
        });
    }

    exec(message, args) {
        return;
    }
    async execSlash(message, args) {
        // Get subscription from message's guild
        let subscription = this.client.subscriptions.get(message.guild.id);

        await message.interaction.deferReply();

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

        if (args.song.includes(`watch?v=`) || args.song.includes(`youtu.be`) || args.song.includes(`spotify.com/track`)) {
            url = args.song;

            // Need to strip out "music" part of string
            if (url.includes(`music.youtube`)) {
                url = url.slice(0, 8) + url.slice(14);
            }

            if (args.song.includes(`spotify.com/track`)) {
                if (play.is_expired()) {
                    await play.refreshToken();
                }

                const sp_data = await play.spotify(args.song);

                await play.search(`${sp_data.name} by ${sp_data.artists[0].name}`, { limit: 1 })
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
            }

            // Create a Track from the user's input
            const track = await Track.from(url, message.interaction.user, {
                async onStart() {
                    message.channel.send({
                        embeds: [
                            new MessageEmbed()
                                .setAuthor(`▶️ Now playing`)
                                .setDescription(`**[${track.video.title}](${track.video.url})**\n[${track.video.channel.name}](${track.video.channel.url})\n\nLength: \`${track.getDuration()}\``)
                                .setThumbnail(track.video.thumbnails[0].url)
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
                        .setDescription(`**[${track.video.title}](${track.video.url})**\n[${track.video.channel.name}](${track.video.channel.url})\n\nLength: \`${track.getDuration()}\``)
                        .setThumbnail(track.video.thumbnails[0].url)
                        .setFooter(`Requested by ${message.interaction.user.username}`, message.interaction.user.avatarURL())
                        .setColor(`#36393f`)
                        .setTimestamp()
                ]
            }).catch(global.logger.warn);
        } else if (args.song.includes(`spotify.com/playlist`)) {
            if (play.is_expired()) {
                await play.refreshToken();
            }

            const sp_data = await play.spotify(args.song);

            if (sp_data.type == `playlist`) {
                message.interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setAuthor(`🟡 Processing ${sp_data.total_tracks} Spotify songs`)
                            .setDescription(`**[${sp_data.name}](${sp_data.url})**\n[${sp_data.owner.name}](${sp_data.owner.url})`)
                            .setThumbnail(sp_data.thumbnail.url)
                            .setFooter(`Requested by ${message.author.username}`, message.author.avatarURL())
                            .setColor(`#36393f`)
                            .setTimestamp()
                    ]
                });

                let failedVideos = 0;

                // Create a Track from each song
                for (const song of sp_data.fetched_tracks.get(`1`)) {
                    await play.search(`${song.name} by ${song.artists[0].name}`, { limit: 1 })
                        .then(async results => {
                            if (results[0]) {
                                const track = await Track.from(results[0].url, message.interaction.user, {
                                    async onStart() {
                                        message.channel.send({
                                            embeds: [
                                                new MessageEmbed()
                                                    .setAuthor(`▶️ Now playing`)
                                                    .setDescription(`**[${track.video.title}](${track.video.url})**\n[${track.video.channel.name}](${track.video.channel.url})\n\nLength: \`${track.getDuration()}\``)
                                                    .setThumbnail(track.video.thumbnails[0].url)
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
                            } else {
                                failedVideos++;
                            }
                        });
                }

                if (failedVideos > 0) {
                    await message.channel.send({
                        embeds: [
                            new MessageEmbed()
                                .setDescription(`:information_source: \`${failedVideos}\` video(s) in the playlist were unable to be added`)
                                .setColor(`#36393f`)
                        ]
                    });
                }

                // Reply with success message
                return await message.interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setAuthor(`➕ ${sp_data.total_tracks} Spotify songs queued`)
                            .setDescription(`**[${sp_data.name}](${sp_data.url})**\n[${sp_data.owner.name}](${sp_data.owner.url})`)
                            .setThumbnail(sp_data.thumbnail.url)
                            .setFooter(`Requested by ${message.author.username}`, message.author.avatarURL())
                            .setColor(`#36393f`)
                            .setTimestamp()
                    ]
                });
            } else {
                console.log(`I somehow got to playlist processing code without it being a Spotify playlist?`);
            }
        } else if (args.song.includes(`playlist`)) {
            let input = args.song;

            // Need to strip out "music" part of string
            if (input.includes(`music.youtube`)) {
                input = input.slice(0, 8) + input.slice(14);
            }

            console.log(input);

            // Get playlist from YouTube
            const playlist = await play.playlist_info(input, { incomplete: true });

            message.interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setAuthor(`🟡 Processing ${playlist.total_videos} YouTube songs`)
                        .setDescription(`**[${playlist.title}](${playlist.url})**\n[${playlist.channel.name}](${playlist.channel.url})`)
                        .setThumbnail(playlist.thumbnail.url)
                        .setFooter(`Requested by ${message.author.username}`, message.author.avatarURL())
                        .setColor(`#36393f`)
                        .setTimestamp()
                ]
            });

            // Count private videos
            let privateVideos = 0;

            // Create a Track from each song
            for (const song of playlist.videos) {
                if (song.private) {
                    privateVideos++;
                } else {
                    const track = await Track.from(song.url, message.interaction.user, {
                        async onStart() {
                            message.channel.send({
                                embeds: [
                                    new MessageEmbed()
                                        .setAuthor(`▶️ Now playing`)
                                        .setDescription(`**[${track.video.title}](${track.video.url})**\n[${track.video.channel.name}](${track.video.channel.url})\n\nLength: \`${track.getDuration()}\``)
                                        .setThumbnail(track.video.thumbnails[0].url)
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
            }

            // If private videos are found, send a notice
            if (privateVideos > 0) {
                await message.channel.send({
                    embeds: [
                        new MessageEmbed()
                            .setDescription(`:information_source: \`${privateVideos}\` video(s) in the playlist were private`)
                            .setColor(`#36393f`)
                    ]
                });
            }

            // Reply with success message
            return await message.interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setAuthor(`➕ ${playlist.total_videos} YouTube songs queued`)
                        .setDescription(`**[${playlist.title}](${playlist.url})**\n[${playlist.channel.name}](${playlist.channel.url})`)
                        .setThumbnail(playlist.thumbnail.url)
                        .setFooter(`Requested by ${message.author.username}`, message.author.avatarURL())
                        .setColor(`#36393f`)
                        .setTimestamp()
                ]
            });
        } else {
            await play.search(args.song, { limit: 1 })
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
                        message.channel.send({
                            embeds: [
                                new MessageEmbed()
                                    .setAuthor(`▶️ Now playing`)
                                    .setDescription(`**[${track.video.title}](${track.video.url})**\n[${track.video.channel.name}](${track.video.channel.url})\n\nLength: \`${track.getDuration()}\``)
                                    .setThumbnail(track.video.thumbnails[0].url)
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
                            .setDescription(`**[${track.video.title}](${track.video.url})**\n[${track.video.channel.name}](${track.video.channel.url})\n\nLength: \`${track.getDuration()}\``)
                            .setThumbnail(track.video.thumbnails[0].url)
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