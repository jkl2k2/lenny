const { Command } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);

/*eslint class-methods-use-this: ["error", { "exceptMethods": ["exec", "execSlash"] }] */
class AddMoneyCommand extends Command {
    constructor() {
        super(`addmoney`, {
            aliases: [`addmoney`],
            args: [
                {
                    id: `user`,
                    type: `string`
                },
                {
                    id: `amount`,
                    type: `integer`
                }
            ],
            category: `owner`,
            description: `Add/subtract money from a user`,
            channel: `guild`
        });
    }

    exec(message, args) {
        const target = message.mentions.users.first();

        if (!args.amount || isNaN(args.amount)) return message.channel.send({
            embeds: [
                new MessageEmbed()
                    .setDescription(`<:cross:729019052571492434> Sorry ${message.author.username}, that's an invalid amount.`)
                    .setColor(`#FF3838`)
            ]
        });
        if (!target) return message.channel.send({
            embeds: [
                new MessageEmbed()
                    .setDescription(`<:cross:729019052571492434> Please include a target`)
                    .setColor(`#FF3838`)
            ]
        });

        const success = message.client.currency.add(target.id, args.amount);

        if (success) {
            return message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`:arrow_down: Gave \`$${args.amount}\``)
                        .setColor(`#2EC14E`)
                        .setAuthor(message.author.username, message.author.avatarURL())
                        .setFooter(target.username, target.avatarURL())
                ]
            });
        } else {
            return message.channel.send(`Failed to add money`);
        }
    }
}

module.exports = AddMoneyCommand;