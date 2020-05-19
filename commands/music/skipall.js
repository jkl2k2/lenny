const index = require(`../../index.js`);
const Discord = require(`discord.js`);
const Queues = index.getQueues();

module.exports = {
	name: 'skipall',
	description: 'Empties the queue and skips the current song',
	aliases: ['stop', 'sa'],
	// usage: '[command]',
	// cooldown: 5,
	guildOnly: true,
	enabled: true,
	type: 'music',
	execute(message, args) {

		var dispatcher = index.getDispatcher(message);

		if (dispatcher == undefined || dispatcher.speaking == false) {
			return message.channel.send(new Discord.RichEmbed()
				.setDescription(`<:error:643341473772863508> There is nothing to skip`)
				.setColor(`#FF0000`));
		}

		index.setQueue(message, index.constructQueue());
		index.endDispatcher(message);
		index.setDispatcher(message, undefined);

		message.channel.send(new Discord.RichEmbed()
			.setDescription(`:stop_button: ${message.author.username} skipped all songs`)
			.setColor(`#0083FF`));

	}
};