const { Command } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);

/*eslint class-methods-use-this: ["error", { "exceptMethods": ["exec", "execSlash"] }] */
class CreditCommand extends Command {
    constructor() {
        super(`credit`, {
            aliases: [`credit`],
            category: `fun`,
            description: `View your social credit`,
            channel: `guild`
        });
    }

    exec(message) {
        const target = message.mentions.users.first() || message.author;

        if (target === message.author) {
            const userCredit = message.client.credit.ensure(message.author.id, message.client.credit.default);

            return message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setAuthor(`Your social credit`)
                        .setDescription(`<:comrade:916528736801812530> ${message.author.username}, you have \`${userCredit[`socialCredit`]}\` social credit`)
                        .setColor(`#FF3838`)
                ]
            });
        } else {
            const userCredit = message.client.credit.ensure(target.id, message.client.credit.default);

            return message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setAuthor(`${target.username}'s social credit`)
                        .setDescription(`<:comrade:916528736801812530> ${target.username} has \`${userCredit[`socialCredit`]}\` social credit`)
                        .setColor(`#FF3838`)
                ]
            });
        }
    }
}

module.exports = CreditCommand;