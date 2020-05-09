const index = require(`../../index.js`);
const config = require('config');
const api = config.get(`Bot.api2`);
const ownerID = config.get(`Users.ownerID`);
const jahyID = config.get(`Users.jahyID`);
const Discord = require(`discord.js`);
const YouTube = require(`simple-youtube-api`);
const youtube = new YouTube(api);
const logger = index.getLogger();
const prefix = config.get(`Bot.prefix`);
const Queues = index.getQueues();

module.exports = {
    name: 'search',
    description: `Plays videos from YouTube by letting you select from 5 videos.\nAlternatively, if you are not in a VC it will instead just send the link, just like ${prefix}findsearch.`,
    aliases: ['psearch', 'ps', 'sp'],
    args: true,
    usage: '[(opt.) "playlist"] [search term(s)]',
    cooldown: 3,
    guildOnly: true,
    enabled: true,
    type: 'music',
    execute(message, args) {

        if (!message.member.voiceChannel) {
            // If member not in VC
            if (args.join(" ").includes("playlist")) {
                handlePlaylist(false);
            } else {
                handleVideo(false);
            }

            return;
        }

        if (args[0] == undefined) {
            // If no arguments
            let undefArgsEmbed = new Discord.RichEmbed()
                .setTitle(` `)
                .setDescription(`:no_entry: Please include at least one search term or URL`)
                .setColor(`#FF0000`);
            message.channel.send(undefArgsEmbed);

            return;
        }

        var queue = index.getQueue(message);

        async function process(input, searchingMessage) {
            logger.debug(input.title);

            let newVideo = index.constructVideo(input, message.member);

            if (!Queues.has(message.guild.id)) {
                let newQueue = [];
                newQueue.push(newVideo);
                index.setQueue(message, newQueue);
            } else {
                queue.push(newVideo);
            }

            message.channel.send(new Discord.RichEmbed()
                .setAuthor(`Queued (${newVideo.getPosition()})`, await newVideo.getChannelThumbnail())
                .setDescription(`**[${newVideo.getTitle()}](${newVideo.getURL()})**\nBy: [${await newVideo.getChannelName()}](${newVideo.getChannelURL()})\n\nLength: \`${await newVideo.getLength()}\``)
                .setThumbnail(newVideo.getThumbnail())
                .setTimestamp()
                .setFooter(`Requested by ${newVideo.getRequesterName()}`, newVideo.getRequesterAvatar()));

            if (message.member.voiceChannel) {
                message.member.voiceChannel.join()
                    .then(connection => {
                        if (index.getDispatcher(message) == undefined || (!connection.speaking && !index.getDispatcher(message).paused)) {
                            index.callPlayMusic(message);
                        }
                    })
                    .catch(`${logger.error}`);
            } else {
                logger.error("Failed to join voice channel");
            }
        }

        async function handlePlaylist(play) {
            youtube.searchPlaylists(args.join(" ").substring(9), 5)
                .then(async results => {
                    if (!results[0] && !results[1] && !results[2] && !results[3] && !results[4]) {
                        var noPlaylistFound = new Discord.RichEmbed()
                            .setDescription(`:information_source: Sorry, no playlist could be found with that input`)
                            .setColor(`#0083FF`);
                        message.channel.send(noPlaylistFound);
                        return;
                    }

                    var res1 = (await results[0].getVideos()).length;
                    var searching1 = new Discord.RichEmbed()
                        .setDescription(`:arrows_counterclockwise: Searching for playlists with "${args.join(" ").substring(9)}"
                                         Searching: \`<##-------->\``)
                        .setColor(`#0083FF`);
                    var searchingMessage = await message.channel.send(searching1);

                    var res2 = (await results[1].getVideos()).length;
                    var searching2 = new Discord.RichEmbed()
                        .setDescription(`:arrows_counterclockwise: Searching for playlists with "${args.join(" ").substring(9)}"
                                         Searching: \`<####------>\``)
                        .setColor(`#0083FF`);
                    searchingMessage.edit(searching2);

                    var res3 = (await results[2].getVideos()).length;
                    var searching3 = new Discord.RichEmbed()
                        .setDescription(`:arrows_counterclockwise: Searching for playlists with "${args.join(" ").substring(9)}"
                                         Searching: \`<######---->\``)
                        .setColor(`#0083FF`);
                    searchingMessage.edit(searching3);

                    var res4 = (await results[3].getVideos()).length;
                    var searching4 = new Discord.RichEmbed()
                        .setDescription(`:arrows_counterclockwise: Searching for playlists with "${args.join(" ").substring(9)}"
                                         Searching: \`<########-->\``)
                        .setColor(`#0083FF`);
                    searchingMessage.edit(searching4);

                    var res5 = (await results[4].getVideos()).length;
                    /*
                    var searching5 = new Discord.RichEmbed()
                        .setDescription(`:arrows_counterclockwise: Searching for playlists with "${args.join(" ").substring(9)}"
                                         Searching: \`<##########>\``)
                        .setColor(`#0083FF`);
                    searchingMessage.edit(searching5);
                    */

                    var resultsEmbed = new Discord.RichEmbed()
                        .setAuthor(`Top 5 Playlists For: "${args.join(" ").substring(9)}"`)
                        .setDescription(`1. **[${results[0].title}](${results[0].url})**
                                         Length: **${res1} videos**
                                         Uploader: **${results[0].channelTitle}**

                                         2. **[${results[1].title}](${results[1].url})**
                                         Length: **${res2} videos**
                                         Uploader: **${results[1].channelTitle}**

                                         3. **[${results[2].title}](${results[2].url})**
                                         Length: **${res3} videos**
                                         Uploader: **${results[2].channelTitle}**

                                         4. **[${results[3].title}](${results[3].url})**
                                         Length: **${res4} videos**
                                         Uploader: **${results[3].channelTitle}**

                                         5. **[${results[4].title}](${results[4].url})**
                                         Length: **${res5} videos**
                                         Uploader: **${results[4].channelTitle}**`)
                        .setTimestamp()
                        .setFooter(`Requested by ${message.author.username} - Type the number to select - Type cancel to stop`, message.author.avatarURL);
                    searchingMessage.edit(resultsEmbed);

                    const filter = m => (m.author.id == message.author.id || m.author.id == ownerID || m.author.id == jahyID) && m.content == "1" || m.content == "2" || m.content == "3" || m.content == "4" || m.content == "5" || m.content.toLowerCase() == "cancel";

                    const collector = message.channel.createMessageCollector(filter, { time: 15000, max: 1 });

                    collector.on('collect', async m => {
                        if (m.content.toLowerCase() == "cancel") {
                            let cancelEmbed = new Discord.RichEmbed()
                                .setDescription(`:stop_button: Canceled playing from search`)
                                .setColor(`#0083FF`);
                            searchingMessage.edit(cancelEmbed);
                            return;
                        }

                        if (play) {
                            await youtube.getPlaylist(results[parseInt(m.content) - 1].url)
                                .then(async playlist => {
                                    if (playlist) {
                                        var videos = await playlist.getVideos();

                                        var processing = await message.channel.send(new Discord.RichEmbed()
                                            .setAuthor(`🔄 Processing playlist`)
                                            .setDescription(`**[${playlist.title}](${playlist.url})**\nBy: [${playlist.channel.title}](${playlist.channel.url})\nNumber of videos: \`${videos.length}\``)
                                            .setThumbnail(playlist.thumbnails.default.url)
                                            .setTimestamp()
                                            .setFooter(`Requested by ${message.author.username}`, message.author.avatarURL));

                                        var encounteredPrivate = false;
                                        var privateCounter = 0;

                                        for (var video of videos) {
                                            var newVideo = index.constructVideo(video, message.member);
                                            if (newVideo.getTitle() == "Private video") {
                                                encounteredPrivate = true;
                                                privateCounter++;
                                            } else {
                                                queue.push(newVideo);
                                            }
                                        }

                                        if (encounteredPrivate) {
                                            message.channel.send(new Discord.RichEmbed()
                                                .setDescription(`:information_source: \`${privateCounter}\` video(s) from the playlist could not be added due to privacy settings`)
                                                .setColor(`#0083FF`));
                                        }

                                        processing.edit(new Discord.RichEmbed()
                                            .setAuthor(`➕ Queued playlist`)
                                            .setDescription(`**[${playlist.title}](${playlist.url})**\nBy: [${playlist.channel.title}](${playlist.channel.url})\nNumber of videos: \`${videos.length}\``)
                                            .setThumbnail(playlist.thumbnails.default.url)
                                            .setTimestamp()
                                            .setFooter(`Requested by ${message.author.username}`, message.author.avatarURL));

                                        if (message.member.voiceChannel) {
                                            message.member.voiceChannel.join()
                                                .then(connection => {
                                                    if (index.getDispatcher(message) == undefined || (!connection.speaking && !index.getDispatcher(message).paused)) {
                                                        index.callPlayMusic(message);
                                                    }
                                                })
                                                .catch(logger.error);
                                        } else {
                                            logger.warn(`User not in voice channel after playlist processing`);
                                        }
                                    } else {
                                        logger.error(`Playlist not found`);
                                    }
                                });
                        } else {
                            message.channel.send(results[parseInt(m.content) - 1].url);
                        }

                    });

                    collector.on('end', collected => {
                        // When collector expires
                    });
                });
        }

        async function handleVideo(play) {
            youtube.searchVideos(args.join(" "), 5)
                .then(async results => {
                    if (!results[0] && !results[1] && !results[2] && !results[3] && !results[4]) {
                        var noVideoFound = new Discord.RichEmbed()
                            .setDescription(`:information_source: Sorry, no video could be found with that input`)
                            .setColor(`#0083FF`);
                        message.channel.send(noVideoFound);
                        return;
                    }

                    var res1 = index.constructVideo(await results[0].fetch(), message.member);
                    var searching1 = new Discord.RichEmbed()
                        .setDescription(`:arrows_counterclockwise: Searching for videos with "${args.join(" ")}"
                                     Searching: \`<##-------->\``)
                        .setColor(`#0083FF`);
                    var searchingMessage = await message.channel.send(searching1);

                    var res2 = index.constructVideo(await results[1].fetch(), message.member);
                    var searching2 = new Discord.RichEmbed()
                        .setDescription(`:arrows_counterclockwise: Searching for videos with "${args.join(" ")}"
                                     Searching: \`<####------>\``)
                        .setColor(`#0083FF`);
                    searchingMessage.edit(searching2);

                    var res3 = index.constructVideo(await results[2].fetch(), message.member);
                    var searching3 = new Discord.RichEmbed()
                        .setDescription(`:arrows_counterclockwise: Searching for videos with "${args.join(" ")}"
                                     Searching: \`<######---->\``)
                        .setColor(`#0083FF`);
                    searchingMessage.edit(searching3);

                    var res4 = index.constructVideo(await results[3].fetch(), message.member);
                    var searching4 = new Discord.RichEmbed()
                        .setDescription(`:arrows_counterclockwise: Searching for videos with "${args.join(" ")}"
                                     Searching: \`<########-->\``)
                        .setColor(`#0083FF`);
                    searchingMessage.edit(searching4);

                    var res5 = index.constructVideo(await results[4].fetch(), message.member);
                    /*
                    var searching5 = new Discord.RichEmbed()
                        .setDescription(`:arrows_counterclockwise: Searching for videos with "${args.join(" ")}"
                                     Searching: \`<##########>\``)
                        .setColor(`#0083FF`);
                    searchingMessage.edit(searching5);
                    */

                    var resultsEmbed = new Discord.RichEmbed()
                        .setAuthor(`Top 5 Results For: "${args.join(" ")}"`)
                        .setDescription(`1. **[${results[0].title}](${results[0].url})**
                                             Length: **${await res1.getLength()}**
                                             Uploader: **${res1.getChannelName()}**

                                             2. **[${results[1].title}](${results[1].url})**
                                             Length: **${await res2.getLength()}**
                                             Uploader: **${res2.getChannelName()}**

                                             3. **[${results[2].title}](${results[2].url})**
                                             Length: **${await res3.getLength()}**
                                             Uploader: **${res3.getChannelName()}**

                                             4. **[${results[3].title}](${results[3].url})**
                                             Length: **${await res4.getLength()}**
                                             Uploader: **${res4.getChannelName()}**

                                             5. **[${results[4].title}](${results[4].url})**
                                             Length: **${await res5.getLength()}**
                                             Uploader: **${res5.getChannelName()}**`)
                        .setTimestamp()
                        .setFooter(`Requested by ${message.author.username} - Type the number to select - Type cancel to stop`, message.author.avatarURL);
                    searchingMessage.edit(resultsEmbed);

                    const filter = m => (m.author.id == message.author.id || m.author.id == ownerID || m.author.id == jahyID) && m.content == "1" || m.content == "2" || m.content == "3" || m.content == "4" || m.content == "5" || m.content.toLowerCase() == "cancel";

                    const collector = message.channel.createMessageCollector(filter, { time: 30000, max: 1 });

                    collector.on('collect', async m => {
                        if (m.content.toLowerCase() == "cancel") {
                            let cancelEmbed = new Discord.RichEmbed()
                                .setDescription(`:stop_button: Canceled playing from search`)
                                .setColor(`#0083FF`);
                            searchingMessage.edit(cancelEmbed);
                            return;
                        }

                        if (play) {
                            process(await youtube.getVideo(results[parseInt(m.content) - 1].url), searchingMessage);
                        } else {
                            message.channel.send(results[parseInt(m.content) - 1].url);
                        }
                    });

                    collector.on('end', collected => {
                        // When collector expires
                    });
                });
        }

        if (args.join(" ").includes("playlist")) {
            handlePlaylist(true);
        } else {
            handleVideo(true);
        }
    }
};