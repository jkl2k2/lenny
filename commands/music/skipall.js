const index = require(`../../index.js`);
const Discord = require(`discord.js`);
const Queues = index.getQueues();

module.exports = {
	name: 'skipall',
	description: 'Empties the queue and skips the current song',
	aliases: ['sa', 'skipa'],
	// usage: '[command]',
	// cooldown: 5,
	guildOnly: true,
	enabled: true,
	type: 'music',
	execute(message, args) {

		var dispatcher = index.getDispatcher(message);

		if (dispatcher == undefined || dispatcher.speaking == false) {
			let skipFailEmbed = new Discord.RichEmbed()

				.setDescription(`<:error:643341473772863508> There is nothing to skip`)
				.setColor(`#FF0000`);
			message.channel.send(skipFailEmbed);

			return;
		}

		index.setQueue(message, []);
		index.endDispatcher(message);

		let endDispatcherEmbed = new Discord.RichEmbed()

			.setDescription(`:fast_forward: ${message.author.username} skipped all songs`)
			.setColor(`#0083FF`);
		message.channel.send(endDispatcherEmbed);

	}
};