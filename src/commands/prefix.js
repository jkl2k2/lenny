const { Argument, Command } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);

/*eslint class-methods-use-this: ["error", { "exceptMethods": ["exec", "execSlash"] }] */
class PrefixCommand extends Command {
    constructor() {
        super(`prefix`, {
            aliases: [`prefix`],
            args: [
                {
                    id: `newPrefix`
                }
            ],
            category: `admin`,
            description: `Changes the server's prefix`,
            channel: `guild`,
            userPermissions: [`MANAGE_GUILD`]
        });
    }

    exec(message, args) {
        const client = message.client;

        if (!args.newPrefix || args.newPrefix.length > 5 || args.newPrefix.length < 1) {
            return message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`<:cross:729019052571492434> Prefix must be less than 5 characters and at least 1 character long`)
                        .setColor(`#FF3838`)
                ]
            });
        }

        client.settings.ensure(message.guild.id, client.settings.default);

        client.settings.set(message.guild.id, args.newPrefix, `prefix`);

        message.channel.send({
            embeds: [
                new MessageEmbed()
                    .setDescription(`<:check:728881238970073090> Prefix for \`${message.guild.name}\` successfully set to \`${client.settings.get(message.guild.id, `prefix`)}\``)
                    .setColor(`#2EC14E`)
                    .setFooter(`Changed by ${message.author.username}`, message.author.avatarURL())
                    .setTimestamp()
            ]
        });
    }
}

module.exports = PrefixCommand;