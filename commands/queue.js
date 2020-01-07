const index = require(`../index.js`);
const Discord = require(`discord.js`);

function queueResolver(arr, index) {
	if (arr[index]) {
		return `${index + 1}. [${arr[index].getCleanTitle()}](${arr[index].getURL()})`;
	} else {
		return " ";
	}
}

function queueOverflowResolver(arr) {
	if (arr.length <= 5) {
		return " ";
	} else if (arr.length > 5) {
		return `**Total of ${arr.length} songs**`;
	}
}

async function sendEmbed(page, message) {
	var queue = index.getQueue();

	let queueEmbed = new Discord.RichEmbed()
		.setTitle(` `)
		// .setDescription(`${queueResolver(parsedQueue, 0)}\n\n${queueResolver(parsedQueue, 1)}\n\n${queueResolver(parsedQueue, 2)}\n\n${queueResolver(parsedQueue, 3)}\n\n${queueResolver(parsedQueue, 4)}\n\n${queueOverflowResolver(parsedQueue)}`)
		.setDescription(`${queueResolver(queue, 0 + page * 5)}\n\n${queueResolver(queue, 1 + page * 5)}\n\n${queueResolver(queue, 2 + page * 5)}\n\n${queueResolver(queue, 3 + page * 5)}\n\n${queueResolver(queue, 4 + page * 5)}\n\n${queueOverflowResolver(queue)}`)
		.setAuthor(`Current queue - Page ${page + 1}`)
		.setColor(`#0083FF`)
	return await message.channel.send(queueEmbed);
}

async function reactionHandler(sent, message, page) {
	var queue = index.getQueue();

	const filter = (reaction, user) => {
		return ['◀️', '🔘', '▶️'].includes(reaction.emoji.name) && user.id === message.author.id;
	};

	if (page == 0 && !queue[4]) {
		// sent.react('🔘');
	} else if (queueResolver(queue, 4 + page * 5) == " ") {
		sent.react('◀️')
			.then(() => (sent.react('🔘'))
				//.then(() => sent.react('▶️'))
				.catch(() => console.error('One of the emojis failed to react.')));
	} else if (page == 0) {
		sent.react('🔘')
			.then(() => (sent.react('▶️')));
	} else if (page > 0) {
		sent.react('◀️')
			.then(() => (sent.react('🔘'))
				.then(() => sent.react('▶️'))
				.catch(() => console.error('One of the emojis failed to react.')));
	}

	sent.awaitReactions(filter, { max: 1, time: 30000, errors: ['time'] })
		.then(async collected => {
			const reaction = collected.first();

			if (reaction.emoji.name === '◀️') {
				//message.channel.send('(This would go back a page)');
				sent.delete();
				let newEmbed = new Discord.RichEmbed()
					.setTitle(`(What would be page ${page - 1})`)
				var newSent = await sendEmbed(page - 1, message);
				reactionHandler(newSent, message, page - 1);
			} else if (reaction.emoji.name === "🔘") {
				//message.channel.send('(This would go to page 1)');
				sent.delete();
				let newEmbed = new Discord.RichEmbed()
					.setTitle(`(What would be page ${0})`)
				var newSent = await sendEmbed(0, message);
				reactionHandler(newSent, message, 0);
			} else if (reaction.emoji.name === "▶️") {
				//message.channel.send('(This would go to the next page)');
				sent.delete();
				let newEmbed = new Discord.RichEmbed()
					.setTitle(`(What would be page ${page + 1})`)
				var newSent = await sendEmbed(page + 1, message);
				reactionHandler(newSent, message, page + 1);
			}
		})
		.catch(collected => {
			// message.reply('Reaction timeout');
			let noControlQueue = new Discord.RichEmbed()
				.setTitle(` `)
				// .setDescription(`${queueResolver(parsedQueue, 0)}\n\n${queueResolver(parsedQueue, 1)}\n\n${queueResolver(parsedQueue, 2)}\n\n${queueResolver(parsedQueue, 3)}\n\n${queueResolver(parsedQueue, 4)}\n\n${queueOverflowResolver(parsedQueue)}`)
				.setDescription(`${queueResolver(queue, 0 + page * 5)}\n\n${queueResolver(queue, 1 + page * 5)}\n\n${queueResolver(queue, 2 + page * 5)}\n\n${queueResolver(queue, 3 + page * 5)}\n\n${queueResolver(queue, 4 + page * 5)}\n\n${queueOverflowResolver(queue)}`)
				.setAuthor(`Current queue - Page ${page + 1}`)
				.setColor(`#0083FF`)
				.setFooter(`Controls cleared due to inactivity`)
			sent.edit(noControlQueue);
			sent.clearReactions();
		});
}

module.exports = {
	name: 'queue',
	description: 'Returns the current music queue (up to 5 songs)',
	aliases: ['q'],
	// usage: '[command]',
	// cooldown: 5,
	guildOnly: true,
	async execute(message, args) {

		var queue = index.getQueue();

		var page = 0;

		if (queue.length == 0) {
			let emptyQueueEmbed = new Discord.RichEmbed()
				.setTitle(` `)
				.addField(`:information_source: **Current queue**`, `The queue is currently empty`)
				.setColor(`#0083FF`)
			message.channel.send(emptyQueueEmbed);
		} else {
			var sent = await sendEmbed(page, message);
			reactionHandler(sent, message, page);
		}
	}
}