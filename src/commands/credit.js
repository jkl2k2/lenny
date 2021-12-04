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
        const userCredit = message.client.credit.ensure(message.author.id, message.client.credit.default);

        return message.channel.send(`You have ${userCredit[`socialCredit`]} social credit`);
    }
}

module.exports = CreditCommand;