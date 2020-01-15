const index = require(`../index.js`);
const Discord = require(`discord.js`);

module.exports = {
    name: 'move',
    description: 'Moves videos in queue to different positions',
    aliases: ['m'],
    usage: '[1st video\'s position] [position to move to]',
    // cooldown: 5,
    guildOnly: true,
    execute(message, args) {
        var queue = index.getQueue();
        var startPos = args[0] - 1;
        var targetPos = args[1] - 1;

        // If target video exists at that position
        if (queue[startPos]) {
            // If target position is valid
            if (targetPos >= 0 && targetPos < queue.length) {
                queue.splice(targetPos, 0, queue.splice(startPos, 1)[0]);
                index.setQueue(queue);
                if (targetPos == 0) {
                    let moveSuccess = new Discord.RichEmbed()
                        .setDescription(`:white_check_mark: Moved video [${queue[targetPos].getCleanTitle()}](${queue[targetPos].getURL()}) from position #${startPos + 1} to #${targetPos + 1}\n\n[${queue[targetPos].getCleanTitle()}](${queue[targetPos].getURL()})\nwill now play after\n[${index.getPlayingVideo().getCleanTitle()}](${index.getPlayingVideo().getURL()})`)
                        .setColor(`#44C408`)
                    message.channel.send(moveSuccess);
                } else {
                    let moveSuccess = new Discord.RichEmbed()
                        .setDescription(`:white_check_mark: Moved video [${queue[targetPos].getCleanTitle()}](${queue[targetPos].getURL()}) from position #${startPos + 1} to #${targetPos + 1}\n\n[${queue[targetPos].getCleanTitle()}](${queue[targetPos].getURL()})\nwill now play after\n[${queue[targetPos - 1].getCleanTitle()}](${queue[targetPos - 1].getURL()})`)
                        .setColor(`#44C408`)
                    message.channel.send(moveSuccess);
                }
            } else {
                message.channel.send("Target index not valid");
            }
        } else {
            message.channel.send("Starting index not valid");
        }
    }
}