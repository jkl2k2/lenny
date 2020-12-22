// const index = require(`../../index.js`);
const { MessageEmbed } = require(`discord.js`);
// const config = require(`config`);

module.exports = {
    name: 'badge',
    description: 'Use your money to buy badges',
    aliases: ['badges'],
    // args: true,
    // usage: '[command]',
    // altUsage: 'command',
    // cooldown: 5,
    // guildOnly: true,
    enabled: true,
    restrictions: {
        resolvable: [],
        id: [],
    },
    type: 'currency',
    execute(message, args) {
        // Start here
    }
};