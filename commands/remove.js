const index = require(`C:\\Users\\Joshua\\Desktop\\Programming Stuff\\L-Bot Files\\L-Bot-Rewrite\\index.js`);
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

		var target = args[0];

        if (queue[target - 1] == undefined) {
            let indexDNEEmbed = new Discord.RichEmbed()
                .setTitle(`<:error:643341473772863508> Index ${target - 1} of array with given input ${target} does not exist`)
                .setTimestamp()
                .setFooter(`Requested by ${message.author.username}`)
                .setColor(`#FF0000`);
            message.channel.send(indexDNEEmbed);
            return;
        }
        var elementToRemove = queue[target - 1];
        queue.splice(target - 1, 1);
        if (elementToRemove != queue[target]) {
            let queueRemoveEmbed = new Discord.RichEmbed()
                .setTitle(` `)
                .addField(`:white_check_mark: **Successfully removed from queue**`, `[${elementToRemove.getTitle()}](${elementToRemove.getURL()})`)
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