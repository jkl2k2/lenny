const Discord = require(`discord.js`);

module.exports = {
	name: 'skipall',
	description: 'Empties the queue and skips the current song',
	aliases: ['sa'],
	// usage: '[command]',
	// cooldown: 5,
	guildOnly: true,
	enabled: true,
	type: 'music',
	execute(message, args) {

		// Define dispatcher;
		let dispatcher = message.guild.music.dispatcher;

		if (dispatcher == undefined || dispatcher.speaking == false) {
			return message.channel.send(new Discord.MessageEmbed()
				.setDescription(`<:cross:729019052571492434> There is nothing to skip`)
				.setColor(`#FF3838`));
		}

		// Empty queue
		message.guild.music.queue = [];

		// End dispatcher
		message.guild.music.dispatcher.destroy();

		// Empty dispatcher
		message.guild.music.dispatcher = undefined;

		message.channel.send(new Discord.MessageEmbed()
			.setDescription(`:stop_button: ${message.author.username} skipped all songs`)
			.setColor(`#0083FF`));

	}
};