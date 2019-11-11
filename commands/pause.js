const index = require(`../index.js`);
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
				.setTitle(` `)
				.addField(`:pause_button: Paused playback`, `${message.author.username} paused playback`)
				.setColor(`#44C408`)
			message.channel.send(pauseEmbed);
		} else {
			let pauseFailEmbed = new Discord.RichEmbed()
				.setTitle(` `)
				.addField(`<:error:643341473772863508> Pause failed`, `${message.author.username}, the music is already pause`)
				.setColor(`#FF0000`)
			message.channel.send(pauseFailEmbed);
		}
	}
}