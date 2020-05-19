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

		if (queue.lastPlayed != undefined && queue.lastPlayed.getTitle() != undefined) {
			message.channel.send(new Discord.RichEmbed()
				.setDescription(`:track_next: ${message.author.username} skipped **[${queue.lastPlayed.getTitle()}](${queue.lastPlayed.getURL()})**`)
				.setColor(`#0083FF`));
		} else {
			message.channel.send(new Discord.RichEmbed()
				.setDescription(`:track_next: ${message.author.username} skipped the current song`)
				.setColor(`#0083FF`));
		}

		index.endDispatcher(message);
	}
};