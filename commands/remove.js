const index = require(`../index.js`);
const Discord = require(`discord.js`);

module.exports = {
	name: 'remove',
	description: 'Removes a video from the queue',
	aliases: ['queueremove', 'r'],
	usage: '[video number in queue]',
	// cooldown: 5,
	guildOnly: true,
	execute(message, args) {
		args.unshift();
		// index.removeFromQueue(args[0]);

		var queue = index.getQueue();

		var target = parseInt(args[0]);

		var splitArgs = args[0].split('-');

		console.log(splitArgs);

        if (queue[target - 1] == undefined) {
            let indexDNEEmbed = new Discord.RichEmbed()
                .setTitle(` `)
                .addField(`<:error:643341473772863508> Failed to remove`, `${target} is not a valid position in the queue`)
                .setColor(`#FF0000`);
            message.channel.send(indexDNEEmbed);
            return;
        }

        if(splitArgs.length == 2) {
			// console.log(`splitArgs is exactly 2 entries long`);
			
			var index1 = parseInt(splitArgs[0]) - 1;
			var index2 = parseInt(splitArgs[1]) - 1;

			if(queue[index1] && queue[index2]) {
                // message.channel.send(`Remove range is valid for start index [${index1}] and end index [${index2}]`);
                let removeRangeEmbed = new Discord.RichEmbed()
                    .setTitle(` `)
                    .addField(`:white_check_mark: Successfully removed from queue`, `Removed videos from\n[${queue[index1].getTitle()}](${queue[index1].getURL()})\nup to\n[${queue[index2].getTitle()}](${queue[index2].getURL()})`)
                    .setColor(`#44C408`)
                message.channel.send(removeRangeEmbed);
				queue.splice(index1, (index2 - index1) + 1);
                index.setQueue(queue);
                
                return;
			} else {
                // message.channel.send(`Remove range is NOT valid for start index [${index1}] and end index [${index2}]`);
                let invalidRemoveEmbed = new Discord.RichEmbed()
                    .setTitle(` `)
                    .addField(`<:error:643341473772863508> Failed to remove`, `The range you provided is not valid`)
                    .setColor(`#FF0000`)
                message.channel.send(invalidRemoveEmbed);
                
                return;
			}
		}

        var elementToRemove = queue[target - 1];
        queue.splice(target - 1, 1);
        if (elementToRemove != queue[target]) {
            let queueRemoveEmbed = new Discord.RichEmbed()
                .setTitle(` `)
                .addField(`:white_check_mark: Successfully removed from queue`, `[${elementToRemove.getTitle()}](${elementToRemove.getURL()})`)
                .setTimestamp()
                .setFooter(`Requested by ${message.author.username}`)
                .setColor(`#44C408`)
            message.channel.send(queueRemoveEmbed);
            // message.reply(`successfully removed "${elementToRemove.videoTitle}" from queue!`);
        } else {
            let queueRemoveEmbed = new Discord.RichEmbed()
                .setTitle(`Somehow, I failed to remove "[${elementToRemove.getTitle()}](${elementToRemove.getURL()})" from queue. This should never happen.`)
                .setTimestamp()
                .setFooter(`Requested by ${message.author.username}`)
                .setColor(`#FF0000`);
            message.channel.send(queueRemoveEmbed);
            // message.reply(`:thinking: I don't understand.`);
        }

		index.setQueue(queue);
	}
}