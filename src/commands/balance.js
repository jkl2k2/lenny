const { Command } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);

/*eslint class-methods-use-this: ["error", { "exceptMethods": ["exec", "execSlash"] }] */
class BalanceCommand extends Command {
    constructor() {
        super(`balance`, {
            aliases: [`balance`, `bal`, `wallet`],
            args: [
                {
                    name: `user`,
                    type: `user`
                }
            ],
            slashOptions: [
                {
                    name: `user`,
                    type: `USER`,
                    description: `(optional) The user you want to view`,
                    required: false
                }
            ],
            category: `economy`,
            slash: true,
            description: `View your (or another user's) current balance`,
            channel: `guild`
        });
    }

    exec(message) {
        const target = message.mentions.users.first() || message.author;

        return message.channel.send({
            embeds: [
                new MessageEmbed()
                    .setAuthor(`${target.tag}'s balance`, target.avatarURL())
                    .setDescription(`Balance: \`$${message.client.currency.getBalance(target.id)}\``)
                    .setColor(`#2EC14E`)
            ]
        });
    }

    execSlash(message, args) {
        const target = args.user || message.author;

        return message.interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setAuthor(`${target.tag}'s balance`, target.avatarURL())
                    .setDescription(`Balance: \`$${message.client.currency.getBalance(target.id)}\``)
                    .setColor(`#2EC14E`)
            ]
        });
    }
}

module.exports = BalanceCommand;