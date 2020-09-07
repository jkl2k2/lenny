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
		let dispatcher = message.guild.music.dispatcher;

		if (dispatcher != undefined && dispatcher.paused == false) {
			dispatcher.pause();
			message.channel.send(new Discord.MessageEmbed()
				.setDescription(`:pause_button: ${message.author.username} paused playback`)
				.setColor(`#36393f`));
		} else {
			message.channel.send(new Discord.MessageEmbed
				.setDescription(`<:cross:729019052571492434> ${message.author.username}, the music is already paused`)
				.setColor(`#FF3838`));
		}
	}
};