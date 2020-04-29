const index = require(`../../index.js`);
const Discord = require(`discord.js`);
const twitch = require(`twitch-get-stream`);
const Dispatchers = index.getDispatchers();
const client = index.getClient();

module.exports = {
    name: 'twitch',
    description: 'Template command for easier coding, does nothing',
    // aliases: ['aliases'],
    // args: true,
    usage: '[channel URL]',
    // altUsage: 'command',
    // cooldown: 5,
    guildOnly: true,
    enabled: true,
    type: 'music',
    execute(message, args) {
        twitch.get(args[0])
            .then(function (streams) {
                if (message.member.voiceChannel) {
                    message.member.voiceChannel.join()
                        .then(connection => {
                            if (index.getDispatcher(message) == undefined || (!connection.speaking && !index.getDispatcher(message).paused)) {
                                Dispatchers.set(message.guild.id, client.voiceConnections.get(message.guild.id).playStream(streams[0].url));
                            }
                        });
                } else {
                    message.channel.send(`You are not in a voice channel`);
                }
            });
    }
};