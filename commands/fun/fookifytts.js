const index = require(`../../index.js`);
const Discord = require(`discord.js`);
// Any 'require'

module.exports = {
    name: 'fookifytts',
    description: 'Fookify your input W I T H  T T S',
    // aliases: ['aliases'],
    args: true,
    usage: '[text]',
    // altUsage: 'command',
    cooldown: 1,
    // guildOnly: true,
    enabled: true,
    type: 'fun',
    execute(message, args) {
        message.channel.send(args.join(`\n`), { tts: true });
    }
};