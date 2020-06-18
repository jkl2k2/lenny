const index = require(`../../index.js`);
const Discord = require(`discord.js`);
const config = require(`config`);
const fs = require(`fs`);
const logger = index.getLogger();

module.exports = {
    name: 'prefix',
    description: 'Sets the server\'s prefix',
    // aliases: ['aliases'],
    // args: true,
    usage: '[prefix]',
    // altUsage: 'command',
    // cooldown: 5,
    guildOnly: true,
    enabled: true,
    restrictions: {
        resolvable: [`MANAGE_GUILD`],
    },
    type: 'admin',
    execute(message, args) {
        let serverConfig = JSON.parse(fs.readFileSync(`./config/serverConfig.json`, `utf8`));

        serverConfig[message.guild.id] = {
            name: message.guild.name,
            prefix: args[0]
        };

        fs.writeFile(`./config/serverConfig.json`, JSON.stringify(serverConfig, null, `\t`), err => {
            if (err) logger.error(err);
        });

        message.channel.send(new Discord.RichEmbed()
            .setDescription(`:white_check_mark: Prefix for \`${message.guild.name}\` successfully set to \`${args[0]}\``)
            .setColor(`#1b9e56`)
            .setFooter(`Changed by ${message.author.username}`, message.author.avatarURL)
            .setTimestamp());
    }
};