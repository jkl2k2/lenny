const index = require(`C:\\Users\\Joshua\\Desktop\\Programming Stuff\\L-Bot Files\\L-Bot-Rewrite\\index.js`);
const Discord = require(`discord.js`);

module.exports = {
	name: 'pause',
	description: 'Pauses music playback if it wasn\'t already',
	// aliases: ['aliases'],
	// usage: '[command]',
	// cooldown: 5,
	guildOnly: true,
	execute(message, args) {
		// index.pauseMusic(message);

		var dispatcher = index.getDispatcher();

		if (dispatcher != undefined && dispatcher.paused == false) {
			index.pauseMusic();
			let pauseEmbed = new Discord.RichEmbed()
				.setTitle(`:pause_button: ${message.author.username} paused playback`)
				.setColor(`#44C408`)
			message.channel.send(pauseEmbed);
		} else {
			let pauseFailEmbed = new Discord.RichEmbed()
				.setTitle(`<:error:643341473772863508> ${message.author.username}, the music is already paused`)
				.setColor(`#FF0000`)
			message.channel.send(pauseFailEmbed);
		}
	}
}