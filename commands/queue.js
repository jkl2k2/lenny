const index = require(`C:\\Users\\Joshua\\Desktop\\Programming Stuff\\L-Bot Files\\L-Bot-Rewrite\\index.js`);
const Discord = require(`discord.js`);

function queueResolver(arr, index) {
    if (arr[index]) {
        return `${index + 1}. [${arr[index].getTitle()}](${arr[index].getURL()})`;
    } else {
        return " ";
    }
}

function queueOverflowResolver(arr) {
    if (arr.length <= 5) {
        return " ";
    } else if (arr.length > 5) {
        return `**Plus ${arr.length - 5} more songs**`;
    }
}

module.exports = {
	name: 'queue',
	description: 'Returns the current music queue (up to 5 songs)',
	aliases: ['q'],
	// usage: '[command]',
	// cooldown: 5,
	guildOnly: true,
	execute(message, args) {

		var queue = index.getQueue();

		if (queue.length == 0) {
			let emptyQueueEmbed = new Discord.RichEmbed()
				.setTitle(` `)
				.addField(`:information_source: **Current queue**`, `The queue is currently empty`)
				.setColor(`#0083FF`)
			message.channel.send(emptyQueueEmbed);
		} else {
			let queueEmbed = new Discord.RichEmbed()
				.setTitle(` `)
				// .setDescription(`${queueResolver(parsedQueue, 0)}\n\n${queueResolver(parsedQueue, 1)}\n\n${queueResolver(parsedQueue, 2)}\n\n${queueResolver(parsedQueue, 3)}\n\n${queueResolver(parsedQueue, 4)}\n\n${queueOverflowResolver(parsedQueue)}`)
				.addField(`**:information_source: Current queue**`, `${queueResolver(queue, 0)}\n\n${queueResolver(queue, 1)}\n\n${queueResolver(queue, 2)}\n\n${queueResolver(queue, 3)}\n\n${queueResolver(queue, 4)}\n\n${queueOverflowResolver(queue)}`)
				.setColor(`#0083FF`)
			// message.channel.send(`Current queue: ${parsedQueue[0]}\n\nComing up next: ${parsedQueue[1]}`);
			message.channel.send(queueEmbed);
		}
	}
}