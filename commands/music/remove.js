const Discord = require(`discord.js`);

module.exports = {
    name: 'remove',
    description: 'Removes a video from the queue',
    args: true,
    aliases: ['queueremove', 'r'],
    usage: '[video number in queue] OR [range in queue to remove]',
    // cooldown: 5,
    guildOnly: true,
    enabled: true,
    type: 'music',
    execute(message, args) {
        var queue = message.guild.music.queue;

        var target = parseInt(args[0]);

        var splitArgs = args[0].split('-');

        if (queue == undefined || queue[target - 1] == undefined) {
            // Invalid target
            return message.channel.send(new Discord.MessageEmbed()
                .setDescription(`<:cross:729019052571492434> ${target} is not a valid position in the queue`)
                .setColor(`#FF3838`));
        }

        if (splitArgs.length == 2) {
            // If range
            var index1 = parseInt(splitArgs[0]) - 1;
            var index2 = parseInt(splitArgs[1]) - 1;

            if (queue[index1] && queue[index2]) {
                // Range remove successful
                message.channel.send(new Discord.MessageEmbed()
                    .setDescription(`:eject: Removed\n**[${queue[index1].getTitle()}](${queue[index1].getURL()})**\n[+${index2 - index1 - 1} other video(s)] up to\n**[${queue[index2].getTitle()}](${queue[index2].getURL()})**`)
                    .setColor(`#36393f`));

                return queue.splice(index1, (index2 - index1) + 1);
            } else {
                // Invalid range
                return message.channel.send(new Discord.MessageEmbed()
                    .setDescription(`<:cross:729019052571492434> The range you provided is not valid`)
                    .setColor(`#FF3838`));
            }
        }

        var elementToRemove = queue[target - 1];
        queue.splice(target - 1, 1);
        if (elementToRemove != queue[target]) {
            message.channel.send(new Discord.MessageEmbed()
                .setDescription(`:eject: ${message.author.username} removed **[${elementToRemove.getTitle()}](${elementToRemove.getURL()})**`)
                .setColor(`#36393f`));
        } else {
            message.channel.send(new Discord.MessageEmbed()
                .setTitle(`Somehow, I failed to remove "[${elementToRemove.getTitle()}](${elementToRemove.getURL()})" from queue. This should never happen.`)
                .setColor(`#FF3838`));
        }
    }
};