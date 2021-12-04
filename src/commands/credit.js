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
        function determineRank(credit) {
            if (credit === 600) {
                return `ON VACATION`;
            } else if (credit < 700) {
                return `ENEMY OF THE STATE`;
            } else if (credit < 900) {
                return `UNTRUSTWORTHY`;
            } else if (credit < 1000) {
                return `AVERAGE CITIZEN`;
            } else if (credit < 1100) {
                return `GREAT CITIZEN`;
            } else if (credit < 1200) {
                return `IDEAL MEMBER OF SOCIETY`;
            } else {
                return `PRESIDENT XI'S CHOSEN`;
            }
        }

        const target = message.mentions.users.first() || message.author;

        if (target === message.author) {
            const userCredit = message.client.credit.ensure(message.author.id, message.client.credit.default);

            return message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setAuthor(`Your social credit`)
                        .setDescription(`<:comrade:916528736801812530> **${message.author.username}, you have 🇨🇳\`${userCredit[`socialCredit`]}\`🇨🇳 social credit**\n\nYour rank: **${determineRank(userCredit[`socialCredit`])}**`)
                        .setColor(`#FF3838`)
                ]
            });
        } else {
            const userCredit = message.client.credit.ensure(target.id, message.client.credit.default);

            return message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setAuthor(`${target.username}'s social credit`)
                        .setDescription(`<:comrade:916528736801812530> ${target.username} has 🇨🇳\`${userCredit[`socialCredit`]}\`🇨🇳 social credit\n\nTheir rank: **${determineRank(userCredit[`socialCredit`])}**`)
                        .setColor(`#FF3838`)
                ]
            });
        }
    }
}

module.exports = CreditCommand;