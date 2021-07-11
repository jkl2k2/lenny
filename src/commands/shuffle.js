const { Command } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);

class ShuffleCommand extends Command {
    constructor() {
        super(`shuffle`, {
            aliases: [`shuffle`],
            category: `music`,
            description: `Shuffle the queue`,
            channel: `guild` // If guild-only
        });
    }

    exec(message) {
        return;
    }

    execSlash(message) {
        const subscription = this.client.subscriptions.get(message.guild.id);

        if (!subscription || subscription.queue.length === 0) {
            message.interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`<:cross:729019052571492434> Cannot shuffle an empty queue`)
                        .setColor(`#FF3838`)
                ]
            });
        } else {
            subscription.shuffle();

            return message.interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`:twisted_rightwards_arrows: Shuffled \`${subscription.queue.length}\` songs in queue`)
                        .setFooter(`Requested by ${message.author.username}`, message.author.avatarURL())
                        .setColor(`#36393f`)
                ]
            });
        }

    }
}

module.exports = ShuffleCommand;