// Requires
const musicConstructor = require(`./YTVideo`);
const player = require(`./musicPlayer`);
const api = process.env.API1;
const { MessageEmbed } = require(`discord.js`);
const YouTube = require(`simple-youtube-api`);
const YTVideo = require("./YTVideo");
const youtube = new YouTube(api);

const queue = async (message, args, type) => {
    if (!message.member.voice.channel) {
        // If member not in VC
        return message.channel.send(new MessageEmbed()
            .setDescription(`<:cross:729019052571492434> ${message.author}, you are not in a voice channel`)
            .setColor(`#FF3838`));
    }

    //#region Playlist handling
    function handlePlaylist() {
        youtube.getPlaylist(args[0])
            .then(async playlist => {
                if (playlist) {
                    let videos = await playlist.getVideos();

                    const queue = message.guild.music.queue;

                    if (playlist.thumbnails.default) {
                        message.channel.send(new MessageEmbed()
                            .setAuthor(`➕ Queued playlist`)
                            .setDescription(`**[${playlist.title}](${playlist.url})**\nBy: [${playlist.channel.title}](${playlist.channel.url})\nNumber of videos: \`${videos.length}\``)
                            .setThumbnail(playlist.thumbnails.default.url)
                            .setTimestamp()
                            .setFooter(`Requested by ${message.author.username}`, message.author.avatarURL())
                            .setColor(`#36393f`));
                    } else if (videos[0].thumbnails.default) {
                        message.channel.send(new MessageEmbed()
                            .setAuthor(`➕ Queued playlist`)
                            .setDescription(`**[${playlist.title}](${playlist.url})**\nBy: [${playlist.channel.title}](${playlist.channel.url})\nNumber of videos: \`${videos.length}\``)
                            .setThumbnail(videos[0].maxRes.url)
                            .setTimestamp()
                            .setFooter(`Requested by ${message.author.username}`, message.author.avatarURL())
                            .setColor(`#36393f`));
                    } else {
                        message.channel.send(new MessageEmbed()
                            .setAuthor(`➕ Queued playlist`)
                            .setDescription(`**[${playlist.title}](${playlist.url})**\nBy: [${playlist.channel.title}](${playlist.channel.url})\nNumber of videos: \`${videos.length}\``)
                            .setTimestamp()
                            .setFooter(`Requested by ${message.author.username}`, message.author.avatarURL()));
                    }

                    // Set up counter for how many private videos are in the playlist
                    let privateCounter = 0;

                    // Queue videos
                    for (var i = videos.length - 1; i >= 0; i--) {
                        const newVideo = new YTVideo(videos[i], message.member);
                        if (newVideo.getTitle() == "Private video") {
                            privateCounter++;
                        } else {
                            queue.unshift(newVideo);
                        }
                    }

                    // Show how many videos were private
                    if (privateCounter > 0)
                        message.channel.send(new MessageEmbed()
                            .setDescription(`:information_source: ${privateCounter} video(s) from the playlist could not be added due to privacy settings`)
                            .setColor(`#36393f`));

                    if (!message.member.voice.channel) return global.logger.warn(`User not in voice channel after playlist processing`);

                    if (message.member.voice.channel) {
                        message.member.voice.channel.join()
                            .then(connection => {
                                if (!message.guild.music.playing) {
                                    return player.play(message);
                                } else {
                                    global.logger.debug(`Connection speaking`);
                                }
                            })
                            .catch(global.logger.error);
                    } else {
                        global.logger.warn(`User not in voice channel after playlist processing`);
                    }
                } else {
                    global.logger.error(`Playlist not found`);
                    message.channel.send(new MessageEmbed()
                        .setDescription(`:information_source: YouTube could not find a playlist with that input`)
                        .setColor(`#36393f`));
                }
            });
    }
    //#endregion

    //#region Regular video / livestream handling
    async function process(input) {
        // Construct a new YTVideo
        const newVideo = new YTVideo(input, message.member);

        // Easy access to music data
        let music = message.guild.music;

        // Define the music-related variables
        const queue = music.queue;

        // Add new video to queue
        if (type == `play`) {
            queue.push(newVideo);
        } else if (type == `playnext` || type == `playnow`) {
            queue.unshift(newVideo);
        }

        if (type != `playnow` && await newVideo.getLength() == "0:00") {
            if (music.playing) {
                message.channel.send(new MessageEmbed()
                    .setAuthor(`Queued (#${newVideo.getPosition()})`, await newVideo.getChannelThumbnail())
                    .setDescription(`**[${newVideo.getTitle()}](${newVideo.getURL()})**\n[${newVideo.getChannelName()}](${newVideo.getChannelURL()})\n\n\`YouTube Livestream\``)
                    .setThumbnail(newVideo.getThumbnail())
                    .setTimestamp()
                    .setFooter(`Requested by ${newVideo.getRequesterName()}`, newVideo.getRequesterAvatar())
                    .setColor(`#36393f`));
            }
        } else {
            if (type != `playnow` && music.playing) {
                message.channel.send(new MessageEmbed()
                    .setAuthor(`Queued (#${newVideo.getPosition()})`, await newVideo.getChannelThumbnail())
                    .setDescription(`**[${newVideo.getTitle()}](${newVideo.getURL()})**\n[${newVideo.getChannelName()}](${newVideo.getChannelURL()})\n\nLength: \`${await newVideo.getLength()}\``)
                    .setThumbnail(newVideo.getThumbnail())
                    .setTimestamp()
                    .setFooter(`Requested by ${newVideo.getRequesterName()}`, newVideo.getRequesterAvatar())
                    .setColor(`#36393f`));
            }
        }

        if (!message.member.voice.channel) return global.logger.warn(`User not in voice channel after video processing`);

        if (message.member.voice.channel) {
            message.member.voice.channel.join()
                .then(() => {
                    if (!music.playing) {
                        return player.play(message);
                    } else if (type == `playnow`) {
                        // If type is playnow, then end the dispatcher to immediately skip
                        return message.guild.music.dispatcher.end();
                    } else {
                        return global.logger.debug(`Connection speaking`);
                    }
                })
                .catch(error => {
                    global.logger.error(error);
                });
        } else {
            global.logger.error("Failed to join voice channel");
        }
    }

    async function handleVideo() {
        if (args[0].includes("watch?v=") || args[0].includes('youtu.be')) {
            process(await youtube.getVideo(args[0]));
        } else {
            await youtube.searchVideos(args.join(" "), 1)
                .then(async results => {
                    if (results[0]) {
                        process(await youtube.getVideo(results[0].url));
                    } else {
                        message.channel.send(new MessageEmbed()
                            .setDescription(`:information_source: YouTube could not find a video with that input`)
                            .setColor(`#36393f`));
                    }
                });
        }
    }
    //#endregion

    //#region Determine action based on input
    if (args[0].includes("playlist?list=")) {
        handlePlaylist();
    } else {
        handleVideo();
    }
    //#endregion
};

// Export
exports.queue = queue;
