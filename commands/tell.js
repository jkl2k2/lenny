const index = require(`../index.js`);
const Discord = require(`discord.js`);
// Any 'require'

module.exports = {
    name: 'tell',
    description: 'Sends a message to a channel you tag',
    // aliases: ['aliases'],
    args: true,
    usage: '[message]',
    // altUsage: 'command',
    // cooldown: 5,
    guildOnly: true,
    enabled: true,
    execute(message, args) {
        const channel = message.guild.channels.find('name', args[0]);
        if (!channel) return;
        channel.send(`${args.join(" ")}`);
    }
};