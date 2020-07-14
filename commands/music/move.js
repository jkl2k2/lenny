const index = require(`../../index.js`);
const Discord = require(`discord.js`);
const Queues = index.getQueues();

module.exports = {
    name: 'move',
    description: 'Moves videos in queue to different positions',
    args: true,
    aliases: ['m'],
    usage: '[1st video\'s position] [position to move to]',
    // cooldown: 5,
    guildOnly: true,
    enabled: true,
    type: 'music',
    execute(message, args) {
        var fullQueue = index.getQueue(message);
        var queue;
        var startPos = args[0] - 1;
        var targetPos = args[1] - 1;

        if (fullQueue == undefined) {
            return message.channel.send(new Discord.MessageEmbed()
                .setDescription(`<:cross:729019052571492434> The queue is empty`)
                .setColor(`#FF3838`));
        } else {
            queue = fullQueue.list;
        }

        if (!args[0]) {
            return message.channel.send(new Discord.MessageEmbed()
                .setDescription(`<:cross:729019052571492434> Please specify a start position`)
                .setColor(`#FF3838`));
        } else if (!args[1]) {
            return message.channel.send(new Discord.MessageEmbed()
                .setDescription(`<:cross:729019052571492434> Please specify a target position`)
                .setColor(`#FF3838`));
        }

        if (isNaN(args[0])) {
            return message.channel.send(new Discord.MessageEmbed()
                .setDescription(`<:cross:729019052571492434> Start position must be a number`)
                .setColor(`#FF3838`));
        } else if (isNaN(args[1])) {
            return message.channel.send(new Discord.MessageEmbed()
                .setDescription(`<:cross:729019052571492434> Target position must be a number`)
                .setColor(`#FF3838`));
        }

        // If target video exists at that position
        if (queue[startPos]) {
            // If target position is valid
            if (targetPos >= 0 && targetPos < queue.length) {
                queue.splice(targetPos, 0, queue.splice(startPos, 1)[0]);
                if (targetPos == 0) {
                    message.channel.send(new Discord.MessageEmbed()
                        .setDescription(`<:check:728881238970073090> Moved from position #${startPos + 1} to #${targetPos + 1}:\n**[${queue[targetPos].getCleanTitle()}](${queue[targetPos].getURL()})**

                                         It will now play after:
                                         **[${index.getQueue(message).lastPlayed.getCleanTitle()}](${index.getQueue(message).lastPlayed.getURL()})**`)
                        .setColor(`#2EC14E`));
                } else {
                    message.channel.send(new Discord.MessageEmbed()
                        .setDescription(`<:check:728881238970073090> Moved from position #${startPos + 1} to #${targetPos + 1}:\n**[${queue[targetPos].getCleanTitle()}](${queue[targetPos].getURL()})**

                                         It will now play after:
                                         **[${queue[targetPos - 1].getCleanTitle()}](${queue[targetPos - 1].getURL()})**`)
                        .setColor(`#2EC14E`));
                }
            } else {
                message.channel.send(new Discord.MessageEmbed()
                    .setDescription(`<:cross:729019052571492434> Sorry, target position #${targetPos + 1} isn't valid`)
                    .setColor(`#FF3838`));
            }
        } else {
            message.channel.send(new Discord.MessageEmbed()
                .setDescription(`<:cross:729019052571492434> Sorry, there isn't a video at position #${startPos + 1}`)
                .setColor(`#FF3838`));
        }
    }
};