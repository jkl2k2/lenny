const { Command } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);

/*eslint class-methods-use-this: ["error", { "exceptMethods": ["exec", "execSlash"] }] */
class RemoveCommand extends Command {
    constructor() {
        super(`remove`, {
            aliases: [`remove`],
            category: `music`,
            description: `Removes a song from the queue`,
            channel: `guild`,
            slashOptions: [
                {
                    name: 'position',
                    type: 'INTEGER',
                    description: 'Position of the song in queue to remove',
                    required: true,
                },
            ]
        });
    }

    exec() {
        return;
    }

    execSlash(message, args) {
        // Get subscription from message's guild
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
            const removed = subscription.dequeue(args.position - 1);

            return message.interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`:put_litter_in_its_place: Removed **${removed[0].title}**`)
                        .setFooter(`Requested by ${message.author.username}`, message.author.avatarURL())
                        .setColor(`#36393f`)
                ],
            });
        }
    }
}

module.exports = RemoveCommand;