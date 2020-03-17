const index = require(`../index.js`);
const Discord = require(`discord.js`);
const config = require(`config`);

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

		// .setDescription(`${queueResolver(parsedQueue, 0)}\n\n${queueResolver(parsedQueue, 1)}\n\n${queueResolver(parsedQueue, 2)}\n\n${queueResolver(parsedQueue, 3)}\n\n${queueResolver(parsedQueue, 4)}\n\n${queueOverflowResolver(parsedQueue)}`)
		.setDescription(`${queueResolver(queue, 0 + page * 5)}\n\n${queueResolver(queue, 1 + page * 5)}\n\n${queueResolver(queue, 2 + page * 5)}\n\n${queueResolver(queue, 3 + page * 5)}\n\n${queueResolver(queue, 4 + page * 5)}\n\n${queueOverflowResolver(queue)}`)
		.setAuthor(`➡️ Current queue - Page ${page + 1}`)
		.setColor(`#0083FF`);
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
					.setTitle(`(What would be page ${page - 1})`);
				let newSent = await sendEmbed(page - 1, message);
				reactionHandler(newSent, message, page - 1);
			} else if (reaction.emoji.name === "🔘") {
				//message.channel.send('(This would go to page 1)');
				sent.delete();
				let newEmbed = new Discord.RichEmbed()
					.setTitle(`(What would be page ${0})`);
				let newSent = await sendEmbed(0, message);
				reactionHandler(newSent, message, 0);
			} else if (reaction.emoji.name === "▶️") {
				//message.channel.send('(This would go to the next page)');
				sent.delete();
				let newEmbed = new Discord.RichEmbed()
					.setTitle(`(What would be page ${page + 1})`);
				let newSent = await sendEmbed(page + 1, message);
				reactionHandler(newSent, message, page + 1);
			}
		})
		.catch(collected => {
			// message.reply('Reaction timeout');
			let noControlQueue = new Discord.RichEmbed()

				// .setDescription(`${queueResolver(parsedQueue, 0)}\n\n${queueResolver(parsedQueue, 1)}\n\n${queueResolver(parsedQueue, 2)}\n\n${queueResolver(parsedQueue, 3)}\n\n${queueResolver(parsedQueue, 4)}\n\n${queueOverflowResolver(parsedQueue)}`)
				.setDescription(`${queueResolver(queue, 0 + page * 5)}\n\n${queueResolver(queue, 1 + page * 5)}\n\n${queueResolver(queue, 2 + page * 5)}\n\n${queueResolver(queue, 3 + page * 5)}\n\n${queueResolver(queue, 4 + page * 5)}\n\n${queueOverflowResolver(queue)}`)
				.setAuthor(`➡️ Current queue - Page ${page + 1}`)
				.setColor(`#0083FF`)
				.setFooter(`Controls cleared due to inactivity`);
			sent.edit(noControlQueue);
			sent.clearReactions();
		});
}

async function sendDetails(input, c, index) {
	if (await input.getLength() == `unknown`) {
		c.send(new Discord.RichEmbed()
			.setAuthor(`➡️ In queue: Video #${index}`)
			.setDescription(`**[${input.getTitle()}](${input.getURL()})**\nBy: [${await input.getChannelName()}](${input.getChannelURL()})\n\n\`Length not provided by YouTube\``)
			.setThumbnail(input.getThumbnail())
			.setTimestamp()
			.setFooter(`Requested by ${input.getRequesterName()}`));
	} else {
		c.send(new Discord.RichEmbed()
			.setAuthor(`➡️ In queue: Video #${index}`)
			.setDescription(`**[${input.getTitle()}](${input.getURL()})**\nBy: [${await input.getChannelName()}](${input.getChannelURL()})\n\n\`<⚫——————————> (0:00/${await input.getLength()})\``)
			.setThumbnail(input.getThumbnail())
			.setTimestamp()
			.setFooter(`Requested by ${input.getRequesterName()}`));
	}
}

module.exports = {
	name: 'queue',
	description: `Displays the music queue. Controllable with reaction buttons. View info on a specific video in queue by typing ${config.get(`Bot.prefix`)}queue [number]`,
	aliases: ['q'],
	usage: '[position]',
	// cooldown: 5,
	guildOnly: true,
	async execute(message, args) {

		var queue = index.getQueue();

		var page = 0;

		var reqIndex;

		if (args[0]) {
			reqIndex = args[0] - 1;
		}

		if (queue.length == 0) {
			let emptyQueueEmbed = new Discord.RichEmbed()

				.setDescription(`:information_source: The queue is currently empty`)
				.setColor(`#0083FF`);
			message.channel.send(emptyQueueEmbed);
		} else {
			if (args[0] && queue[reqIndex]) {
				sendDetails(queue[reqIndex], message.channel, args[0]);
			} else if (args[0] && !queue[reqIndex]) {
				let invalidQueuePos = new Discord.RichEmbed()

					.setDescription(`<:error:643341473772863508> There is not a video at that spot in the queue`)
					.setColor(`#FF0000`);
				message.channel.send(invalidQueuePos);
			} else if (!args[0]) {
				var sent = await sendEmbed(page, message);
				reactionHandler(sent, message, page);
			}
		}
	}
};