const index = require(`../index.js`);
const Discord = require(`discord.js`);

module.exports = {
    name: 'move',
    description: 'Moves videos in queue to different positions',
    args: true,
    aliases: ['m'],
    usage: '[1st video\'s position] [position to move to]',
    // cooldown: 5,
    guildOnly: true,
    enabled: true,
    execute(message, args) {
        var queue = index.getQueue();
        var startPos = args[0] - 1;
        var targetPos = args[1] - 1;

        if (!args[0]) {
            let noStart = new Discord.RichEmbed()
                .setDescription(`<:error:643341473772863508> Please specify a start position`)
                .setColor(`#FF0000`);
            message.channel.send(noStart);
            return;
        } else if (!args[1]) {
            let noTarget = new Discord.RichEmbed()
                .setDescription(`<:error:643341473772863508> Please specify a target position`)
                .setColor(`#FF0000`);
            message.channel.send(noTarget);
            return;
        }

        if (isNaN(args[0])) {
            let startNaN = new Discord.RichEmbed()
                .setDescription(`<:error:643341473772863508> Start position must be a number`)
                .setColor(`#FF0000`);
            message.channel.send(startNaN);
            return;
        } else if (isNaN(args[1])) {
            let targetNaN = new Discord.RichEmbed()
                .setDescription(`<:error:643341473772863508> Target position must be a number`)
                .setColor(`#FF0000`);
            message.channel.send(targetNaN);
            return;
        }

        // If target video exists at that position
        if (queue[startPos]) {
            // If target position is valid
            if (targetPos >= 0 && targetPos < queue.length) {
                queue.splice(targetPos, 0, queue.splice(startPos, 1)[0]);
                if (targetPos == 0) {
                    let moveSuccess = new Discord.RichEmbed()
                        .setDescription(`:white_check_mark: Moved video [${queue[targetPos].getCleanTitle()}](${queue[targetPos].getURL()}) from position #${startPos + 1} to #${targetPos + 1}
                        
                                         [${queue[targetPos].getCleanTitle()}](${queue[targetPos].getURL()})
                                         will now play after
                                         [${index.getPlayingVideo().getCleanTitle()}](${index.getPlayingVideo().getURL()})`)
                        .setColor(`#44C408`);
                    message.channel.send(moveSuccess);
                } else {
                    let moveSuccess = new Discord.RichEmbed()
                        .setDescription(`:white_check_mark: Moved video [${queue[targetPos].getCleanTitle()}](${queue[targetPos].getURL()}) from position #${startPos + 1} to #${targetPos + 1}
                        
                                         [${queue[targetPos].getCleanTitle()}](${queue[targetPos].getURL()})
                                         will now play after
                                         [${queue[targetPos - 1].getCleanTitle()}](${queue[targetPos - 1].getURL()})`)
                        .setColor(`#44C408`);
                    message.channel.send(moveSuccess);
                }
            } else {
                let targetInvalid = new Discord.RichEmbed()
                    .setDescription(`<:error:643341473772863508> Sorry, target position #${targetPos + 1} isn't valid`)
                    .setColor(`#FF0000`);
                message.channel.send(targetInvalid);
            }
        } else {
            let startInvalid = new Discord.RichEmbed()
                .setDescription(`<:error:643341473772863508> Sorry, there isn't a video at position #${startPos + 1}`)
                .setColor(`#FF0000`);
            message.channel.send(startInvalid);
        }
    }
};