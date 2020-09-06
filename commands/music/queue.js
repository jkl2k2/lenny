const index = require(`../../index.js`);
const Discord = require(`discord.js`);
const config = require(`config`);
const fetch = require(`node-fetch`);
const hex = require(`rgb-hex`);
const colorThief = require(`colorthief`);

async function queueResolver(arr, index) {
	if (arr[index]) {
		return `\`${index + 1}.\` **[${arr[index].getTitle()}](${arr[index].getURL()})**\n\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0By: **${arr[index].getChannelName()}**\n\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0Length: \`${await arr[index].getLength()}\``;
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
	let queue = message.guild.music.queue;

	let queueEmbed = new Discord.MessageEmbed()

		// .setDescription(`${queueResolver(parsedQueue, 0)}\n\n${queueResolver(parsedQueue, 1)}\n\n${queueResolver(parsedQueue, 2)}\n\n${queueResolver(parsedQueue, 3)}\n\n${queueResolver(parsedQueue, 4)}\n\n${queueOverflowResolver(parsedQueue)}`)
		.setDescription(`${await queueResolver(queue, 0 + page * 5)}\n\n${await queueResolver(queue, 1 + page * 5)}\n\n${await queueResolver(queue, 2 + page * 5)}\n\n${await queueResolver(queue, 3 + page * 5)}\n\n${await queueResolver(queue, 4 + page * 5)}\n\n${await queueOverflowResolver(queue)}`)
		.setAuthor(`Current queue - Page ${page + 1}`, message.guild.iconURL())
		.setColor(`#0083FF`);
	return await message.channel.send(queueEmbed);
}

async function reactionHandler(sent, message, page) {
	var queue = message.guild.music.queue;

	const filter = (reaction, user) => {
		return ['◀️', '🔘', '▶️'].includes(reaction.emoji.name) && user.id === message.author.id;
	};

	if (page == 0 && !queue[5]) {

		// Only first page exists

	} else if (!queue[(page + 1) * 5]) {

		// Last page
		sent.react('◀️')
			.catch(() => console.error('One of the emojis failed to react.'));

	} else if (page == 0) {

		// First page
		sent.react('▶️');

	} else if (page > 0) {

		// Any page between first and last
		sent.react('◀️')
			.then(() => sent.react('▶️'))
			.catch(() => console.error('One of the emojis failed to react.'));

	}

	sent.awaitReactions(filter, { max: 1, time: 30000, errors: ['time'] })
		.then(async collected => {
			const reaction = collected.first();

			if (reaction.emoji.name === '◀️') {
				// Previous page
				sent.delete();
				let newSent = await sendEmbed(page - 1, message);
				reactionHandler(newSent, message, page - 1);
			} else if (reaction.emoji.name === "🔘") {
				// Home page (first page)
				sent.delete();
				let newSent = await sendEmbed(0, message);
				reactionHandler(newSent, message, 0);
			} else if (reaction.emoji.name === "▶️") {
				// Next page
				sent.delete();
				let newSent = await sendEmbed(page + 1, message);
				reactionHandler(newSent, message, page + 1);
			}
		})
		.catch(async collected => {
			// message.reply('Reaction timeout');
			/*
			let noControlQueue = new Discord.MessageEmbed()

				// .setDescription(`${queueResolver(parsedQueue, 0)}\n\n${queueResolver(parsedQueue, 1)}\n\n${queueResolver(parsedQueue, 2)}\n\n${queueResolver(parsedQueue, 3)}\n\n${queueResolver(parsedQueue, 4)}\n\n${queueOverflowResolver(parsedQueue)}`)
				.setDescription(`${await queueResolver(queue, 0 + page * 5)}\n\n${await queueResolver(queue, 1 + page * 5)}\n\n${await queueResolver(queue, 2 + page * 5)}\n\n${await queueResolver(queue, 3 + page * 5)}\n\n${await queueResolver(queue, 4 + page * 5)}\n\n${queueOverflowResolver(queue)}`)
				.setAuthor(`Current queue - Page ${page + 1}`, message.guild.iconURL())
				.setColor(`#0083FF`);
			*/
			// .setFooter(`Controls cleared due to inactivity`);
			// sent.edit(noControlQueue);
			sent.reactions.removeAll();
		});
}

async function sendDetails(input, c, index) {
	if (input.getType() == "livestream") {
		let buffer = await fetch(input.getThumbnail()).then(r => r.buffer()).then(buf => `data:image/jpg;base64,` + buf.toString('base64'));
		let rgb = await colorThief.getColor(buffer);
		let musicEmbed = new Discord.MessageEmbed()
			.setAuthor(`In queue: video #${index}`, await input.getChannelThumbnail())
			.setDescription(`**[${input.getTitle()}](${input.getURL()})**\n[${input.getChannelName()}](${input.getChannelURL()})\n\n\`YouTube Livestream\``)
			.setThumbnail(input.getThumbnail())
			.setTimestamp()
			.setFooter(`Requested by ${input.getRequesterName()}`, input.getRequesterAvatar())
			.setColor(`#${hex(rgb[0], rgb[1], rgb[2])}`);
		c.send(musicEmbed);
		lastDetails = musicEmbed;
	} else if (input.getType() == "twitch") {
		let channel = await twitchClient.helix.users.getUserByName(input.getTitle());
		let musicEmbed = new Discord.MessageEmbed()
			.setAuthor(`In queue: video #${index}`, channel.profilePictureUrl)
			.setDescription(`**[${channel.displayName}](www.twitch.tv/${channel.displayName})**\n\n\`Twitch Livestream\``)
			.setThumbnail(channel.profilePictureUrl)
			.setTimestamp()
			.setFooter(`Requested by ${input.getRequesterName()}`, input.getRequesterAvatar());
		c.send(musicEmbed);
		lastDeatils = musicEmbed;
	} else {
		let buffer = await fetch(input.getThumbnail()).then(r => r.buffer()).then(buf => `data:image/jpg;base64,` + buf.toString('base64'));
		let rgb = await colorThief.getColor(buffer);
		let musicEmbed = new Discord.MessageEmbed()
			.setAuthor(`In queue: video #${index}`, await input.getChannelThumbnail())
			.setDescription(`**[${input.getTitle()}](${input.getURL()})**\n[${input.getChannelName()}](${input.getChannelURL()})\n\nLength: \`${await input.getLength()}\``)
			.setThumbnail(input.getThumbnail())
			.setTimestamp()
			.setFooter(`Requested by ${input.getRequesterName()}`, input.getRequesterAvatar())
			.setColor(`#${hex(rgb[0], rgb[1], rgb[2])}`);
		c.send(musicEmbed);
		lastDetails = musicEmbed;
	}
}

module.exports = {
	name: 'queue',
	description: `Displays the music queue. Controllable with reaction buttons. View info on a specific video in queue by typing ${config.get(`Bot.prefix`)}queue [number]`,
	aliases: ['q'],
	usage: '[position]',
	// cooldown: 5,
	guildOnly: true,
	enabled: true,
	type: 'music',
	async execute(message, args) {

		let queue = message.guild.music.queue;

		if (queue == undefined || queue.length == 0) {
			return message.channel.send(new Discord.MessageEmbed()
				.setDescription(`:information_source: The queue is currently empty`)
				.setColor(`#0083FF`));
		}

		var page = 0;

		var reqIndex;

		if (args[0]) {
			reqIndex = args[0] - 1;
		}

		if (queue == undefined || queue.length == 0) {
			message.channel.send(new Discord.MessageEmbed()
				.setDescription(`:information_source: The queue is currently empty`)
				.setColor(`#0083FF`));
		} else {
			if (args[0] && queue[reqIndex]) {
				sendDetails(queue[reqIndex], message.channel, args[0]);
			} else if (args[0] && !queue[reqIndex]) {
				message.channel.send(new Discord.MessageEmbed()
					.setDescription(`<:cross:729019052571492434> There is not a video at that spot in the queue`)
					.setColor(`#FF3838`));
			} else if (!args[0]) {
				var sent = await sendEmbed(page, message);
				reactionHandler(sent, message, page);
			}
		}
	}
};