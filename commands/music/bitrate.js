const index = require(`../../index.js`);
const Discord = require(`discord.js`);
// Any 'require'

module.exports = {
    name: 'bitrate',
    description: 'Sets bitrate of dispatcher',
    // aliases: ['aliases'],
    args: true,
    usage: '[bitrate]',
    // altUsage: 'command',
    // cooldown: 5,
    guildOnly: true,
    enabled: true,
    type: 'music',
    execute(message, args) {
        var dispatcher = index.getDispatcher(message);
        if (dispatcher != undefined) {
            dispatcher.setBitrate(args[0]);
            message.channel.send(`Dispatcher bitrate set to ${args[0]}`);
        } else {
            message.channel.send(`Dispatcher is undefined, can't set bitrate`);
        }
    }
};