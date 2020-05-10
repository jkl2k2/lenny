const index = require(`../../index.js`);
const Discord = require(`discord.js`);

module.exports = {
	name: 'skip',
	description: 'Skips the current song',
	aliases: ['s', 'stop'],
	// usage: '[command]',
	// cooldown: 5,
	guildOnly: true,
	enabled: true,
	type: 'music',
	execute(message, args) {
		var dispatcher = index.getDispatcher(message);

		if (dispatcher == undefined || dispatcher.speaking == false) {
			return message.channel.send(new Discord.RichEmbed()
				.setDescription(`:information_source: There is nothing to skip`)
				.setColor(`#0083FF`));
		}

		var queue = index.getQueue(message);

		if (queue.repeat) queue.repeat = false;

		index.endDispatcher(message);

		return message.channel.send(new Discord.RichEmbed()
			.setDescription(`:fast_forward: ${message.author.username} skipped the current song`)
			.setColor(`#0083FF`));
	}
};