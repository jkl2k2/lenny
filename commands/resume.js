const index = require(`../index.js`);
const Discord = require(`discord.js`);

module.exports = {
	name: 'resume',
	description: 'Resumes music playback if it was paused',
	// aliases: ['aliases'],
	// usage: '[command]',
	// cooldown: 5,
	guildOnly: true,
	execute(message, args) {
		// index.resumeMusic(message);

		var dispatcher = index.getDispatcher();

		if (dispatcher != undefined && dispatcher.paused == true) {
			index.resumeMusic();
			let resumeEmbed = new Discord.RichEmbed()
				 
				.setDescription(`:arrow_forward: ${message.author.username} resumed playback`)
				.setColor(`#0083FF`)
			message.channel.send(resumeEmbed);
		} else {
			let resumeFailEmbed = new Discord.RichEmbed()
				 
				.setDescription(`<:error:643341473772863508> ${message.author.username}, the music is already playing`)
				.setColor(`#FF0000`)
			message.channel.send(resumeFailEmbed);
		}
	}
}