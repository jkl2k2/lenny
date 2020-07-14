const index = require(`../../index.js`);
const Discord = require(`discord.js`);
const config = require(`config`);
const client = index.getClient();
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
        var count1 = 0;
        var count2 = 0;
        var msg = "";
        var msg2 = "";
        for (var server of client.guilds.cache.array()) {
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