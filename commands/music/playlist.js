const index = require(`../../index.js`);
const config = require('config');
const api = config.get(`Bot.api2`);
const ownerID = config.get(`Users.ownerID`);
const jahyID = config.get(`Users.jahyID`);
const Discord = require(`discord.js`);
const YouTube = require(`simple-youtube-api`);
const youtube = new YouTube(api);
const logger = index.getLogger();
const Queues = index.getQueues();

module.exports = {
    name: 'playlist',
    description: 'Searches for a playlist and lets you choose which one to play',
    aliases: ['playp', 'playplaylist', 'list', 'searchp', 'searchplaylist'],
    args: true,
    usage: '[search term(s)]',
    // altUsage: 'command',
    cooldown: 5,
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
                .setDescription(`<:cross:728885860623319120> Please include at least one search term or URL`)
                .setColor(`#FF0000`);
            message.channel.send(undefArgsEmbed);

            return;
        }

        var queue = index.getQueue(message);

        if (!Queues.has(message.guild.id)) {
            let newQueue = new index.constructQueue();
            index.setQueue(message, newQueue);
            queue = index.getQueue(message);
        }

        youtube.searchPlaylists(args.join(" "))
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
                    .setDescription(`:arrows_counterclockwise: Searching for playlists with "${args.join(" ")}"
                                         Searching: \`<##-------->\``)
                    .setColor(`#0083FF`);
                var searchingMessage = await message.channel.send(searching1);

                var res2 = (await results[1].getVideos()).length;
                var searching2 = new Discord.RichEmbed()
                    .setDescription(`:arrows_counterclockwise: Searching for playlists with "${args.join(" ")}"
                                         Searching: \`<####------>\``)
                    .setColor(`#0083FF`);
                searchingMessage.edit(searching2);

                var res3 = (await results[2].getVideos()).length;
                var searching3 = new Discord.RichEmbed()
                    .setDescription(`:arrows_counterclockwise: Searching for playlists with "${args.join(" ")}"
                                         Searching: \`<######---->\``)
                    .setColor(`#0083FF`);
                searchingMessage.edit(searching3);

                var res4 = (await results[3].getVideos()).length;
                var searching4 = new Discord.RichEmbed()
                    .setDescription(`:arrows_counterclockwise: Searching for playlists with "${args.join(" ")}"
                                         Searching: \`<########-->\``)
                    .setColor(`#0083FF`);
                searchingMessage.edit(searching4);

                var res5 = (await results[4].getVideos()).length;
                /*
                var searching5 = new Discord.RichEmbed()
                    .setDescription(`:arrows_counterclockwise: Searching for playlists with "${args.join(" ")}"
                                         Searching: \`<##########>\``)
                    .setColor(`#0083FF`);
                searchingMessage.edit(searching5);
                */

                var resultsEmbed = new Discord.RichEmbed()
                    .setAuthor(`Top 5 Playlists For: "${args.join(" ")}"`)
                    .setDescription(`\`1.\` **[${results[0].title}](${results[0].url})**
                                         Uploader: **${results[0].channelTitle}**
                                         Length: \`${res1} videos\`

                                         \`2.\` **[${results[1].title}](${results[1].url})**
                                         Uploader: **${results[1].channelTitle}**
                                         Length: \`${res2} videos\`

                                         \`3.\` **[${results[2].title}](${results[2].url})**
                                         Uploader: **${results[2].channelTitle}**
                                         Length: \`${res3} videos\`

                                         \`4.\` **[${results[3].title}](${results[3].url})**
                                         Uploader: **${results[3].channelTitle}**
                                         Length: \`${res4} videos\`

                                         \`5.\` **[${results[4].title}](${results[4].url})**
                                         Uploader: **${results[4].channelTitle}**
                                         Length: \`${res5} videos\``)
                    .setTimestamp()
                    .setFooter(`Requested by ${message.author.username} - Type the number to select - Type cancel to stop`, message.author.avatarURL);
                searchingMessage.edit(resultsEmbed);

                const filter = m => (m.author.id == message.author.id || m.author.id == ownerID || m.author.id == jahyID) && m.content == "1" || m.content == "2" || m.content == "3" || m.content == "4" || m.content == "5" || m.content.toLowerCase() == "cancel";

                const collector = message.channel.createMessageCollector(filter, { time: 60000, max: 1 });

                collector.on('collect', async m => {
                    if (m.content.toLowerCase() == "cancel") {
                        return searchingMessage.edit(new Discord.RichEmbed()
                            .setDescription(`:stop_button: Canceled playing from search`)
                            .setColor(`#0083FF`));
                    }

                    await youtube.getPlaylist(results[parseInt(m.content) - 1].url)
                        .then(async playlist => {
                            if (playlist) {
                                var videos = await playlist.getVideos();

                                searchingMessage.edit(new Discord.RichEmbed()
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
                                        queue.list.push(newVideo);
                                    }
                                }

                                if (encounteredPrivate) {
                                    message.channel.send(new Discord.RichEmbed()
                                        .setDescription(`:information_source: \`${privateCounter}\` video(s) from the playlist could not be added due to privacy settings`)
                                        .setColor(`#0083FF`));
                                }

                                searchingMessage.edit(new Discord.RichEmbed()
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

                });

                collector.on('end', collected => {
                    // When collector expires
                    /*
                    return searchingMessage.edit(new Discord.RichEmbed()
                        .setDescription(`:stop_button: Search canceled from inactivity`)
                        .setColor(`#0083FF`));
                    */
                });
            });
    }
};