const Discord = require(`discord.js`);
const config = require(`config`);
const ownerID = config.get(`Users.ownerID`);

module.exports = {
    name: 'listservers',
    description: 'Lists the servers the bot is currently in',
    // aliases: ['aliases'],
    // args: true,
    // usage: '[command]',
    // altUsage: 'command',
    // cooldown: 5,
    // guildOnly: true,
    enabled: true,
    restrictions: {
        resolvable: [],
        id: [ownerID],
    },
    type: 'admin',
    execute(message, args) {
        const client = message.client;
        let count = 0;
        let msg = "";
        for (const server of client.guilds.cache.array()) {
            msg += server.name;
            msg += "\n";
            count++;
        }
        message.channel.send(new Discord.MessageEmbed()
            .setDescription(`**__Servers__**\n\n${msg}\n**Total: ${count} servers**`));
    }
};