const index = require(`../index.js`);
const Discord = require(`discord.js`);
const thesaurize = require(`thesaurize`);

module.exports = {
    name: 'testing',
    description: 'Testing',
    aliases: ['t'],
    // usage: '[command]',
    // cooldown: 5,
    // guildOnly: true,
    enabled: true,
    execute(message, args) {
        message.channel.send(thesaurize(args.join(" ")));
    }
};