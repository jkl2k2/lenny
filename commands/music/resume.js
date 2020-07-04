const index = require(`../../index.js`);
const Discord = require(`discord.js`);

module.exports = {
	name: 'resume',
	description: 'Resumes music playback if it was paused',
	// aliases: ['aliases'],
	// usage: '[command]',
	// cooldown: 5,
	guildOnly: true,
	enabled: true,
	type: 'music',
	execute(message, args) {
		// index.resumeMusic(message);

		var dispatcher = index.getDispatcher(message);

		if (dispatcher != undefined && dispatcher.paused == true) {
			dispatcher.resume();
			let resumeEmbed = new Discord.RichEmbed()

				.setDescription(`:arrow_forward: ${message.author.username} resumed playback`)
				.setColor(`#0083FF`);
			message.channel.send(resumeEmbed);
		} else {
			let resumeFailEmbed = new Discord.RichEmbed()

				.setDescription(`<:cross:729019052571492434> ${message.author.username}, the music is already playing`)
				.setColor(`#FF3838`);
			message.channel.send(resumeFailEmbed);
		}
	}
};