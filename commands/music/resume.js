const index = require(`../../index.js`);
const Discord = require(`discord.js`);

module.exports = {
	name: 'resume',
	description: 'Resumes music playback if it was paused',
	aliases: ['start'],
	// usage: '[command]',
	// cooldown: 5,
	guildOnly: true,
	enabled: true,
	type: 'music',
	execute(message, args) {
		let dispatcher = message.guild.music.dispatcher;

		if (dispatcher != undefined && dispatcher.paused == true) {
			dispatcher.resume();
			message.channel.send(new Discord.MessageEmbed()
				.setDescription(`:arrow_forward: ${message.author.username} resumed playback`)
				.setColor(`#36393f`));
		} else {
			message.channel.send(new Discord.MessageEmbed()
				.setDescription(`<:cross:729019052571492434> ${message.author.username}, the music is already playing`)
				.setColor(`#FF3838`));
		}
	}
};