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
const amazon = require(`amazon-music-info`);

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
                    description: 'Plays a song or playlist from either YouTube, Spotify (albums as well), or SoundCloud',
                    required: true,
                }
            ],
            category: `music`,
            description: `Plays a song or playlist from either YouTube, Spotify (albums as well), or SoundCloud`,
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
                        .setAuthor(`🟢 Queued`)
                        .setDescription(`**[${track.video.title}](${track.video.url})**\n[${track.video.channel.name}](${track.video.channel.url})\n\nLength: \`${track.getDuration()}\``)
                        .setThumbnail(track.video.thumbnails[0].url)
                        .setFooter(`Requested by ${message.interaction.user.username}`, message.interaction.user.avatarURL())
                        .setColor(`#36393f`)
                        .setTimestamp()
                ]
            }).catch(global.logger.warn);
        }

        if (args.song.includes(`watch?v=`) || args.song.includes(`youtu.be`)) {
            // Need to strip out "music" part of string, if applicable
            if (args.song.includes(`music.youtube`)) {
                return await process(args.song.slice(0, 8) + args.song.slice(14));
            }

            return sendEmbed(await process(args.song));
        } else if (args.song.includes(`music.amazon.com`)) {
            if (amazon.isAmazonMusic(args.song)) {
                if (amazon.isAmazonMusicUserPlaylist(args.song) || amazon.isAmazonMusicAlbum(args.song)) {
                    message.interaction.editReply({
                        embeds: [
                            new MessageEmbed()
                                .setAuthor(`🔎 Loading Amazon Music...`)
                                .setDescription(`Finding playlist info...`)
                                .setFooter(`Requested by ${message.author.username}`, message.author.avatarURL())
                                .setColor(`#36393f`)
                                .setTimestamp()
                        ]
                    });

                    try {
                        const data = await amazon.getData(args.song);

                        await message.interaction.editReply({
                            embeds: [
                                new MessageEmbed()
                                    .setAuthor(`🟡 Processing ${data.items.length} Amazon Music songs`)
                                    .setDescription(`**${data.title}**\nAmazon Music Playlist/Album\n\n\`~${1.25 * data.items.length} seconds\` to process`)
                                    .setFooter(`Requested by ${message.author.username}`, message.author.avatarURL())
                                    .setColor(`#36393f`)
                                    .setTimestamp()
                            ]
                        });

                        let failedVideos = 0;

                        // Create a Track from each song
                        for (const song of data.items) {
                            if (!song.url) {
                                failedVideos++;
                            } else {
                                await process(song.url);
                            }
                        }

                        if (failedVideos > 0) {
                            await message.channel.send({
                                embeds: [
                                    new MessageEmbed()
                                        .setDescription(`:information_source: \`${failedVideos}\` song(s) were unavailable on Amazon Music and could not be added`)
                                        .setColor(`#36393f`)
                                ]
                            });
                        }

                        // Reply with success message
                        return await message.interaction.editReply({
                            embeds: [
                                new MessageEmbed()
                                    .setAuthor(`🟢 ${data.items.length} Amazon Music songs queued`)
                                    .setDescription(`**${data.title}**\nAmazon Music User Playlist`)
                                    .setFooter(`Requested by ${message.author.username}`, message.author.avatarURL())
                                    .setColor(`#36393f`)
                                    .setTimestamp()
                            ]
                        });
                    } catch (err) {
                        console.log(err.message);

                        return await message.interaction.editReply({
                            embeds: [
                                new MessageEmbed()
                                    .setAuthor(`🔴 Error with Amazon Music`)
                                    .setDescription(`**Amazon Music couldn't understand your link.**\nThat Amazon link may be invalid.`)
                                    .setFooter(`Requested by ${message.author.username}`, message.author.avatarURL())
                                    .setColor(`#FF3838`)
                                    .setTimestamp()
                            ]
                        });
                    }
                } else if (amazon.isAmazonMusicPlaylist(args.song) && !args.song.includes(`/my/playlists/`)) {
                    return await message.interaction.editReply({
                        embeds: [
                            new MessageEmbed()
                                .setAuthor(`🔴 Error with Amazon Music`)
                                .setDescription(`**Sorry, official Amazon playlists are not supported.**\n Please submit a user-created playlist.`)
                                .setFooter(`Requested by ${message.author.username}`, message.author.avatarURL())
                                .setColor(`#FF3838`)
                                .setTimestamp()
                        ]
                    });
                } else {
                    return await message.interaction.editReply({
                        embeds: [
                            new MessageEmbed()
                                .setAuthor(`🔴 Error with Amazon Music`)
                                .setDescription(`**music.amazon.com links are only supported for albums and user-created playlists.**\n\n\`If you are trying to submit a user-created playlist, use the Share button and not the browser URL.\``)
                                .setFooter(`Requested by ${message.author.username}`, message.author.avatarURL())
                                .setColor(`#FF3838`)
                                .setTimestamp()
                        ]
                    });
                }
            } else {
                return await message.interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setAuthor(`🔴 Error with Amazon Music`)
                            .setDescription(`**Amazon Music couldn't understand your link.**\nThat Amazon link may be invalid.`)
                            .setFooter(`Requested by ${message.author.username}`, message.author.avatarURL())
                            .setColor(`#FF3838`)
                            .setTimestamp()
                    ]
                });
            }
        } else if (args.song.includes(`spotify.com`)) {
            if (play.is_expired()) {
                await play.refreshToken();
            }

            if (play.sp_validate(args.song) == `track`) {
                message.interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setAuthor(`🔎 Loading Spotify Song...`)
                            .setDescription(`Finding closest YouTube match...`)
                            .setFooter(`Requested by ${message.author.username}`, message.author.avatarURL())
                            .setColor(`#36393f`)
                            .setTimestamp()
                    ]
                });

                try {
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
                } catch (err) {
                    console.log(err.message);
                    return await message.interaction.editReply({
                        embeds: [
                            new MessageEmbed()
                                .setAuthor(`🔴 Error with Spotify`)
                                .setDescription(`**Spotify encountered an error when processing the song.**\nI unfortunately don't have any other info.`)
                                .setFooter(`Requested by ${message.author.username}`, message.author.avatarURL())
                                .setColor(`#FF3838`)
                                .setTimestamp()
                        ]
                    });
                }
            } else if (play.sp_validate(args.song) == `playlist`) {
                message.interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setAuthor(`🔎 Loading Spotify Playlist...`)
                            .setDescription(`Looking up info...`)
                            .setFooter(`Requested by ${message.author.username}`, message.author.avatarURL())
                            .setColor(`#36393f`)
                            .setTimestamp()
                    ]
                });

                try {
                    const sp_data = await play.spotify(args.song);

                    message.interaction.editReply({
                        embeds: [
                            new MessageEmbed()
                                .setAuthor(`🟡 Processing ${sp_data.total_tracks} Spotify songs`)
                                .setDescription(`**[${sp_data.name}](${sp_data.url})**\n[${sp_data.owner.name}](${sp_data.owner.url})\n\n\`~${1.25 * sp_data.total_tracks} seconds\` to process`)
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
                                .setAuthor(`🟢 ${sp_data.total_tracks} Spotify songs queued`)
                                .setDescription(`**[${sp_data.name}](${sp_data.url})**\n[${sp_data.owner.name}](${sp_data.owner.url})`)
                                .setThumbnail(sp_data.thumbnail.url)
                                .setFooter(`Requested by ${message.author.username}`, message.author.avatarURL())
                                .setColor(`#36393f`)
                                .setTimestamp()
                        ]
                    });
                } catch (err) {
                    console.log(err.message);
                    return await message.interaction.editReply({
                        embeds: [
                            new MessageEmbed()
                                .setAuthor(`🔴 Error with Spotify`)
                                .setDescription(`**Spotify encountered an error when processing the playlist.**\nI unfortunately don't have any other info.`)
                                .setFooter(`Requested by ${message.author.username}`, message.author.avatarURL())
                                .setColor(`#FF3838`)
                                .setTimestamp()
                        ]
                    });
                }
            } else if (play.sp_validate(args.song) == `album`) {
                message.interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setAuthor(`🔎 Loading Spotify Album...`)
                            .setDescription(`Looking up info...`)
                            .setFooter(`Requested by ${message.author.username}`, message.author.avatarURL())
                            .setColor(`#36393f`)
                            .setTimestamp()
                    ]
                });

                try {
                    const sp_data = await play.spotify(args.song);

                    message.interaction.editReply({
                        embeds: [
                            new MessageEmbed()
                                .setAuthor(`🟡 Processing ${sp_data.total_tracks} Spotify songs`)
                                .setDescription(`**[${sp_data.name}](${sp_data.url})**\n[${sp_data.artists[0].name}](${sp_data.artists[0].url})\n\n\`~${1.25 * sp_data.total_tracks} seconds\` to process`)
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
                                .setAuthor(`🟢 ${sp_data.total_tracks} Spotify songs queued`)
                                .setDescription(`**[${sp_data.name}](${sp_data.url})**\n[${sp_data.artists[0].name}](${sp_data.artists[0].url})`)
                                .setThumbnail(sp_data.thumbnail.url)
                                .setFooter(`Requested by ${message.author.username}`, message.author.avatarURL())
                                .setColor(`#36393f`)
                                .setTimestamp()
                        ]
                    });
                } catch (err) {
                    console.log(err.message);
                    return await message.interaction.editReply({
                        embeds: [
                            new MessageEmbed()
                                .setAuthor(`🔴 Error with Spotify`)
                                .setDescription(`**Spotify encountered an error when processing the album.**\nI unfortunately don't have any other info.`)
                                .setFooter(`Requested by ${message.author.username}`, message.author.avatarURL())
                                .setColor(`#FF3838`)
                                .setTimestamp()
                        ]
                    });
                }
            } else {
                // Invalid Spotify URL
                return await message.interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setAuthor(`🔴 Error with Spotify`)
                            .setDescription(`**Your Spotify Link appears to be invalid.**\n\`Only Spotify songs, albums, and playlists are supported.\``)
                            .setFooter(`Requested by ${message.author.username}`, message.author.avatarURL())
                            .setColor(`#FF3838`)
                            .setTimestamp()
                    ]
                });
            }
        } else if (args.song.includes(`soundcloud.com/`)) {
            if (args.song.includes(`/sets/`) && !args.song.includes(`?in=`)) {
                // Is a playlist
                message.interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setAuthor(`🔎 Loading SoundCloud Playlist...`)
                            .setDescription(`Looking up info...`)
                            .setFooter(`Requested by ${message.author.username}`, message.author.avatarURL())
                            .setColor(`#36393f`)
                            .setTimestamp()
                    ]
                });

                const so_data = await play.soundcloud(args.song);
                await so_data.fetch();

                message.interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setAuthor(`🟡 Processing ${so_data.total_tracks} SoundCloud songs`)
                            .setDescription(`**[${so_data.name}](${so_data.url})**\n[${so_data.user.name}](${so_data.user.url})\n\n\`~${0.4 * so_data.total_tracks} seconds\` to process`)
                            .setThumbnail(so_data.fetched_tracks[0].thumbnail)
                            .setFooter(`Requested by ${message.author.username}`, message.author.avatarURL())
                            .setColor(`#36393f`)
                            .setTimestamp()
                    ]
                });

                for (const song of so_data.fetched_tracks) {
                    await process(song.url);
                }

                // Reply with success message
                return await message.interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setAuthor(`🟢 ${so_data.total_tracks} SoundCloud songs queued`)
                            .setDescription(`**[${so_data.name}](${so_data.url})**\n[${so_data.user.name}](${so_data.user.url})`)
                            .setThumbnail(so_data.fetched_tracks[0].thumbnail)
                            .setFooter(`Requested by ${message.author.username}`, message.author.avatarURL())
                            .setColor(`#36393f`)
                            .setTimestamp()
                    ]
                });
            } else {
                // Is a normal track
                return sendEmbed(await process(args.song));
            }
        } else if (args.song.includes(`playlist`)) {
            let input = args.song;

            // Need to strip out "music" part of string
            if (input.includes(`music.youtube`)) {
                input = input.slice(0, 8) + input.slice(14);
            }

            message.interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setAuthor(`🔎 Loading YouTube Playlist...`)
                        .setDescription(`Looking up info...`)
                        .setFooter(`Requested by ${message.author.username}`, message.author.avatarURL())
                        .setColor(`#36393f`)
                        .setTimestamp()
                ]
            });

            // Get playlist from YouTube
            const playlist = await play.playlist_info(input, { incomplete: true });

            message.interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setAuthor(`🟡 Processing ${playlist.total_videos} YouTube songs`)
                        .setDescription(`**[${playlist.title}](${playlist.url})**\n[${playlist.channel.name}](${playlist.channel.url})\n\n\`~${0.75 * playlist.total_videos} seconds\` to process`)
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
                        .setAuthor(`🟢 ${playlist.total_videos} YouTube songs queued`)
                        .setDescription(`**[${playlist.title}](${playlist.url})**\n[${playlist.channel.name}](${playlist.channel.url})`)
                        .setThumbnail(playlist.thumbnail.url)
                        .setFooter(`Requested by ${message.author.username}`, message.author.avatarURL())
                        .setColor(`#36393f`)
                        .setTimestamp()
                ]
            });
        } else {
            // YouTube search
            message.interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setAuthor(`🔎 Searching YouTube...`)
                        .setDescription(`Finding closest match...`)
                        .setFooter(`Requested by ${message.author.username}`, message.author.avatarURL())
                        .setColor(`#36393f`)
                        .setTimestamp()
                ]
            });

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