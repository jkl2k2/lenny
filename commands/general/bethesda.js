const index = require(`../../index.js`);
const Discord = require(`discord.js`);
const config = require(`config`);
const logger = index.getLogger();
// const hastebin = require(`hastebin-gen`);

module.exports = {
    name: 'bethesda',
    description: 'i love bethesda',
    // aliases: ['aliases'],
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
    type: 'general',
    async execute(message, args) {
        var unformatted = message.content.substring(10, message.content.length);

        var split = unformatted.split(`\n`);

        var formatted = ``;

        for (var i = 0; i < split.length; i++) {
            formatted += `{"${split[i]}":[]},\n`;
        }

        // const haste = await hastebin('code', { extension: 'txt' });

        logger.debug(formatted);
    }
};