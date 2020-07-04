const index = require(`../../index.js`);
const Discord = require(`discord.js`);

module.exports = {
	name: 'pause',
	description: 'Pauses music playback',
	// aliases: ['aliases'],
	// usage: '[command]',
	// cooldown: 5,
	guildOnly: true,
	enabled: true,
	type: 'music',
	execute(message, args) {
		// index.pauseMusic(message);

		var dispatcher = index.getDispatcher(message);

		if (dispatcher != undefined && dispatcher.paused == false) {
			dispatcher.pause();
			let pauseEmbed = new Discord.RichEmbed()

				.setDescription(`:pause_button: ${message.author.username} paused playback`)
				.setColor(`#0083FF`);
			message.channel.send(pauseEmbed);
		} else {
			let pauseFailEmbed = new Discord.RichEmbed()

				.setDescription(`<:cross:729019052571492434> ${message.author.username}, the music is already paused`)
				.setColor(`#FF3838`);
			message.channel.send(pauseFailEmbed);
		}
	}
};