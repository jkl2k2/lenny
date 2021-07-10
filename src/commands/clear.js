const { Command } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);

class ClearCommand extends Command {
    constructor() {
        super(`clear`, {
            aliases: [`clear`, `clearqueue`],
            category: `music`,
            description: `Clears out the queue`,
            channel: `guild`
        });
    }

    exec(message) {
        return;
    }

    execSlash(message) {
        const subscription = this.client.subscriptions.get(message.guild.id);

        if (!subscription) {
            return message.interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`:information_source: The queue is currently empty`)
                        .setColor(`#36393f`)
                ],
                ephemeral: true
            });
        } else {
            subscription.clearQueue();

            return message.interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`:put_litter_in_its_place: Cleared the queue`)
                        .setFooter(`Requested by ${message.author.username}`, message.author.avatarURL())
                        .setColor(`#36393f`)
                ],
            });
        }
    }
}

module.exports = ClearCommand;