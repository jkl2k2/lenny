const Discord = require(`discord.js`);
const config = require(`config`);
const ownerID = config.get(`Users.ownerID`);

module.exports = {
    name: 'clearservers',
    description: 'Template command for easier coding, does nothing',
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
    async execute(message, args) {
        const client = message.client;
        let count1 = 0;
        let count2 = 0;
        let msg = "";
        let msg2 = "";
        for (const server of client.guilds.cache.array()) {
            if (server.id == "471193210102743040" || server.id == "438485091824697344" || server.id == "593318966202597383") {
                msg += server.name;
                msg += "\n";
                count1++;
            } else {
                server.leave();
                msg2 += server.name;
                msg2 += "\n";
                count2++;
            }
        }
        message.channel.send(new Discord.MessageEmbed()
            .setDescription(`**__Servers NOT left__**\n${msg}\n**Total: ${count1} servers whitelisted**\n\n**__Servers the bot has left__**\n${msg2}\n**Total: ${count2} servers have been left**`));
    }
};