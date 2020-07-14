const index = require(`../../index.js`);
const Discord = require(`discord.js`);
const twitch = require(`twitch-get-stream`);
const Dispatchers = index.getDispatchers();
const client = index.getClient();
const Queues = index.getQueues();
const twitchClient = index.getTwitchClient();

module.exports = {
    name: 'twitch',
    description: 'Plays Twitch streams',
    // aliases: ['aliases'],
    // args: true,
    usage: '[channel name]',
    // altUsage: 'command',
    // cooldown: 5,
    guildOnly: true,
    enabled: false,
    type: 'music',
    async execute(message, args) {
        twitch.get(args[0])
            .then(async function (streams) {
                var newVideo = index.constructTwitch(streams[0].url, args[0], message.member);

                if (!Queues.has(message.guild.id)) {
                    let newQueue = index.constructQueue();
                    newQueue.push(newVideo);
                    index.setQueue(message, newQueue);
                    console.log("Created queue");
                } else {
                    queue.push(newVideo);
                    console.log("Pushed Twitch stream to queue");
                }

                if (message.member.voice.channel) {
                    message.member.voice.channel.join()
                        .then(connection => {
                            if (index.getDispatcher(message) == undefined) {
                                index.callPlayMusic(message);
                            }
                        });
                } else {
                    message.channel.send(`You are not in a voice channel`);
                }

                let channel = await twitchClient.helix.users.getUserByName(args[0]);
                message.channel.send(new Discord.MessageEmbed()
                    .setAuthor(`Queued`, channel.profilePictureUrl)
                    .setDescription(`**[${channel.displayName}](www.twitch.tv/${channel.displayName})**\n\n\`Twitch Livestream\``)
                    .setThumbnail(channel.profilePictureUrl)
                    .setTimestamp()
                    .setFooter(`Requested by ${newVideo.getRequesterName()}`, newVideo.getRequesterAvatar()));
            })

            .catch(err => {
                if (err.message.includes(`404`)) {
                    message.channel.send(new Discord.MessageEmbed()
                        .setDescription(`<:cross:729019052571492434>\`${err}\`\n\nSorry, but the Twitch channel you provided either doesn't exist or is not currently streaming.`)
                        .setColor(`#FF3838`));
                }
            });
    }
};