const { Command } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);

/*eslint class-methods-use-this: ["error", { "exceptMethods": ["exec", "execSlash"] }] */
class MoveCommand extends Command {
    constructor() {
        super(`move`, {
            aliases: [`move`],
            args: [
                {
                    id: `start`,
                    type: `integer`,
                },
                {
                    id: `end`,
                    type: `integer`
                }
            ],
            slash: true,
            slashOptions: [
                {
                    name: 'start',
                    type: 'INTEGER',
                    description: 'The video to move',
                    required: true,
                },
                {
                    name: 'end',
                    type: 'INTEGER',
                    description: 'The position to move the video to',
                    required: true,
                }
            ],
            category: `music`,
            description: `Moves a song's position in queue`,
            channel: `guild`
        });
    }

    exec(message, args) {
        return;
    }

    async execSlash(message, args) {
        const subscription = this.client.subscriptions.get(message.guild.id);

        await message.interaction.deferReply();

        if (!subscription) {
            return message.interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`:information_source: The queue is currently empty`)
                        .setColor(`#36393f`)
                ]
            });
        }

        const queue = subscription.queue;

        if (queue == undefined || queue.length == 0) {
            return message.interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`:information_source: The queue is currently empty`)
                        .setColor(`#36393f`)
                ]
            });
        }

        const startPos = args.start - 1;
        const targetPos = args.end - 1;

        if (!args.start) {
            return message.interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`<:cross:729019052571492434> Please specify a start position`)
                        .setColor(`#FF3838`)
                ]
            });
        } else if (!args.end) {
            return message.interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`<:cross:729019052571492434> Please specify a target position`)
                        .setColor(`#FF3838`)
                ]
            });
        }

        if (isNaN(args.start)) {
            return message.interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`<:cross:729019052571492434> Start position must be a number`)
                        .setColor(`#FF3838`)
                ]
            });
        } else if (isNaN(args.end)) {
            return message.interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`<:cross:729019052571492434> Target position must be a number`)
                        .setColor(`#FF3838`)
                ]
            });
        }

        // If target video exists at that position
        if (queue[startPos]) {
            // If target position is valid
            if (targetPos >= 0 && targetPos < queue.length) {
                queue.splice(targetPos, 0, queue.splice(startPos, 1)[0]);
                if (targetPos == 0) {
                    message.interaction.editReply({
                        embeds: [
                            new MessageEmbed()
                                .setDescription(`<:check:728881238970073090> Moved from position \`#${startPos + 1}\` to \`#${targetPos + 1}\`:\n**[${queue[targetPos].video.title}](${queue[targetPos].video.url})**

                                         It will now play after the current song is finished.`)
                                .setColor(`#2EC14E`)
                        ]
                    });
                } else {
                    message.interaction.editReply({
                        embeds: [
                            new MessageEmbed()
                                .setDescription(`<:check:728881238970073090> Moved from position \`#${startPos + 1}\` to \`#${targetPos + 1}\`:\n**[${queue[targetPos].video.title}](${queue[targetPos].video.url})**

                                         It will now play after:
                                         **[${queue[targetPos - 1].video.title}](${queue[targetPos - 1].video.url})**`)
                                .setColor(`#2EC14E`)
                        ]
                    });
                }
            } else {
                message.interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setDescription(`<:cross:729019052571492434> Sorry, target position \`#${targetPos + 1}\` isn't valid`)
                            .setColor(`#FF3838`)
                    ]
                });
            }
        } else {
            message.interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`<:cross:729019052571492434> Sorry, there isn't a video at position \`#${startPos + 1}\``)
                        .setColor(`#FF3838`)
                ]
            });
        }
    }
}

module.exports = MoveCommand;