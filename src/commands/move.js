const { Command } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);

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
            category: `music`,
            description: `Moves a song's position in queue`,
            channel: `guild`
        });
    }

    exec(message, args) {
        const queue = message.guild.music.queue;
        const startPos = args.start - 1;
        const targetPos = args.end - 1;

        if (queue == undefined) {
            return message.channel.send(new MessageEmbed()
                .setDescription(`<:cross:729019052571492434> The queue is empty`)
                .setColor(`#FF3838`));
        }

        if (!args.start) {
            return message.channel.send(new MessageEmbed()
                .setDescription(`<:cross:729019052571492434> Please specify a start position`)
                .setColor(`#FF3838`));
        } else if (!args.end) {
            return message.channel.send(new MessageEmbed()
                .setDescription(`<:cross:729019052571492434> Please specify a target position`)
                .setColor(`#FF3838`));
        }

        if (isNaN(args.start)) {
            return message.channel.send(new MessageEmbed()
                .setDescription(`<:cross:729019052571492434> Start position must be a number`)
                .setColor(`#FF3838`));
        } else if (isNaN(args.end)) {
            return message.channel.send(new MessageEmbed()
                .setDescription(`<:cross:729019052571492434> Target position must be a number`)
                .setColor(`#FF3838`));
        }

        // If target video exists at that position
        if (queue[startPos]) {
            // If target position is valid
            if (targetPos >= 0 && targetPos < queue.length) {
                queue.splice(targetPos, 0, queue.splice(startPos, 1)[0]);
                if (targetPos == 0) {
                    message.channel.send(new MessageEmbed()
                        .setDescription(`<:check:728881238970073090> Moved from position \`#${startPos + 1}\` to \`#${targetPos + 1}\`:\n**[${queue[targetPos].getTitle()}](${queue[targetPos].getURL()})**

                                         It will now play after:
                                         **[${message.guild.music.lastPlayed.getTitle()}](${message.guild.music.lastPlayed.getURL()})**`)
                        .setColor(`#2EC14E`));
                } else {
                    message.channel.send(new MessageEmbed()
                        .setDescription(`<:check:728881238970073090> Moved from position \`#${startPos + 1}\` to \`#${targetPos + 1}\`:\n**[${queue[targetPos].getTitle()}](${queue[targetPos].getURL()})**

                                         It will now play after:
                                         **[${queue[targetPos - 1].getTitle()}](${queue[targetPos - 1].getURL()})**`)
                        .setColor(`#2EC14E`));
                }
            } else {
                message.channel.send(new MessageEmbed()
                    .setDescription(`<:cross:729019052571492434> Sorry, target position \`#${targetPos + 1}\` isn't valid`)
                    .setColor(`#FF3838`));
            }
        } else {
            message.channel.send(new MessageEmbed()
                .setDescription(`<:cross:729019052571492434> Sorry, there isn't a video at position \`#${startPos + 1}\``)
                .setColor(`#FF3838`));
        }
    }
}

module.exports = MoveCommand;