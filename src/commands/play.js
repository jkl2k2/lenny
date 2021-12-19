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
                    description: 'Plays a song or playlist from YouTube or Spotify',
                    required: true,
                }
            ],
            category: `music`,
            description: `Plays a song or playlist from YouTube or Spotify`,
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

        async function process(url) {
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

            // Queue track
            subscription.enqueue(track);

            return track;
        }

        function sendEmbed(track) {
            return message.interaction.editReply({
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
        }

        if (args.song.includes(`watch?v=`) || args.song.includes(`youtu.be`) || args.song.includes(`spotify.com/track`)) {
            // Need to strip out "music" part of string, if applicable
            if (args.song.includes(`music.youtube`)) {
                return await process(args.song.slice(0, 8) + args.song.slice(14));
            }

            if (args.song.includes(`spotify.com/track`)) {
                if (play.is_expired()) {
                    await play.refreshToken();
                }

                const sp_data = await play.spotify(args.song);

                await play.search(`${sp_data.name} by ${sp_data.artists[0].name}`, { limit: 1 })
                    .then(async results => {
                        if (results[0]) {
                            return sendEmbed(await process(results[0].url));
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
            } else {
                // Just a plain YouTube link
                return sendEmbed(await process(args.song));
            }
        } else if (args.song.includes(`spotify.com/playlist`) || args.song.includes(`spotify.com/album`)) {
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
                                await process(results[0].url);
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
            } else if (sp_data.type == `album`) {
                message.interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setAuthor(`🟡 Processing ${sp_data.total_tracks} Spotify songs`)
                            .setDescription(`**[${sp_data.name}](${sp_data.url})**\n[${sp_data.artists[0].name}](${sp_data.artists[0].url})`)
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
                                await process(results[0].url);
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
                            .setDescription(`**[${sp_data.name}](${sp_data.url})**\n[${sp_data.artists[0].name}](${sp_data.artists[0].url})`)
                            .setThumbnail(sp_data.thumbnail.url)
                            .setFooter(`Requested by ${message.author.username}`, message.author.avatarURL())
                            .setColor(`#36393f`)
                            .setTimestamp()
                    ]
                });
            }
        } else if (args.song.includes(`playlist`)) {
            let input = args.song;

            // Need to strip out "music" part of string
            if (input.includes(`music.youtube`)) {
                input = input.slice(0, 8) + input.slice(14);
            }

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
                    await process(song.url);
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
                        try {
                            return sendEmbed(await process(results[0].url));
                        } catch (err) {
                            global.logger.warn(err);
                            return await message.interaction.editReply(`Failed to play track`);
                        }
                    } else {
                        return message.interaction.editReply({
                            embeds: [
                                new MessageEmbed()
                                    .setDescription(`:information_source: YouTube could not find a video with that input`)
                                    .setColor(`#36393f`)
                            ]
                        });
                    }
                });
        }
    }
}

module.exports = PlayCommand;