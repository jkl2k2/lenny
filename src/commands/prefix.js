const { Argument, Command } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);

/*eslint class-methods-use-this: ["error", { "exceptMethods": ["exec", "execSlash"] }] */
class PrefixCommand extends Command {
    constructor() {
        super(`prefix`, {
            aliases: [`prefix`],
            args: [
                {
                    id: `newPrefix`,
                    type: Argument.validate('string', (m, p, str) => str.length <= 3),
                    prompt: {
                        start: () => {
                            const embed = new MessageEmbed()
                                .setDescription(`:arrow_right: What would you like to set the prefix to? **Limit of 3 characters.**`)
                                .setFooter(`Type "cancel" to stop`)
                                .setColor(`#36393f`);
                            return embed;
                        },
                        retry: () => {
                            const embed = new MessageEmbed()
                                .setDescription(`<:cross:729019052571492434> That prefix is not valid. Please send another one instead.`)
                                .setFooter(`Type "cancel" to stop`)
                                .setColor(`#FF3838`);
                            return embed;
                        },
                        cancel: () => {
                            const embed = new MessageEmbed()
                                .setDescription(`<:cross:729019052571492434> Prefix change canceled.`)
                                .setColor(`#FF3838`);
                            return embed;
                        },
                        ended: () => {
                            const embed = new MessageEmbed()
                                .setDescription(`<:cross:729019052571492434> Too many retries, prefix change canceled.`)
                                .setColor(`#FF3838`);
                            return embed;
                        },
                        timeout: () => {
                            const embed = new MessageEmbed()
                                .setDescription(`<:cross:729019052571492434> Prefix change timed out.`)
                                .setColor(`#FF3838`);
                            return embed;
                        },
                        retries: 3,
                        time: 30000
                    }
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