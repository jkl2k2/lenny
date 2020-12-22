// const index = require(`../../index.js`);
// const Discord = require(`discord.js`);
// const config = require(`config`);
// Any 'require'

module.exports = {
    name: 'resetbadge',
    description: 'Admin badge reset',
    // aliases: ['aliases'],
    args: true,
    // usage: '[command]',
    // altUsage: 'command',
    // cooldown: 5,
    guildOnly: true,
    enabled: true,
    restrictions: {
        resolvable: [],
        id: [`125109015632936960`],
    },
    type: 'currency',
    execute(message, args) {
        const target = message.mentions.users.first();

        const client = message.client;
        const casinoUser = client.casinoUser.ensure(target.id, client.casinoUser.default);

        client.casinoUser.set(message.author.id, 0, `badgeLevel`);

        message.channel.send(`Reset badge.`);
    }
};