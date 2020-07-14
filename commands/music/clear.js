const index = require(`../../index.js`);
const Discord = require(`discord.js`);
// Any 'require'

module.exports = {
    name: 'clear',
    description: 'Clears the queue without stopping playback',
    // aliases: ['aliases'],
    // args: true,
    // usage: '[command]',
    // altUsage: 'command',
    // cooldown: 5,
    guildOnly: true,
    enabled: true,
    type: 'music',
    execute(message, args) {
        var queue = index.getQueue(message);

        if (queue == undefined) {
            return message.channel.send(new Discord.MessageEmbed()
                .setDescription(`<:cross:729019052571492434> There is nothing to skip`)
                .setColor(`#FF3838`));
        } else {
            queue.list = [];
            return message.channel.send(new Discord.MessageEmbed()
                .setDescription(`:arrow_double_up: ${message.author.username} cleared the queue`)
                .setColor(`#0083FF`));
        }
    }
};