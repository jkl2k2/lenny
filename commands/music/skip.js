const Discord = require(`discord.js`);

module.exports = {
	name: 'skip',
	description: 'Skips the current song',
	aliases: ['s', 'stop'],
	// usage: '[command]',
	// cooldown: 5,
	guildOnly: true,
	enabled: true,
	type: 'music',
	execute(message, args) {

		if (!message.guild.music.playing) {
			return message.channel.send(new Discord.MessageEmbed()
				.setDescription(`:information_source: There is nothing to skip`)
				.setColor(`#36393f`));
		}

		if (message.guild.music.repeat) message.guild.music.repeat = false;

		if (message.guild.music.lastPlayed != undefined && message.guild.music.lastPlayed.getTitle() != undefined) {
			message.channel.send(new Discord.MessageEmbed()
				.setDescription(`:track_next: ${message.author.username} skipped **[${message.guild.music.lastPlayed.getTitle()}](${message.guild.music.lastPlayed.getURL()})**`)
				.setColor(`#36393f`));
		} else {
			message.channel.send(new Discord.MessageEmbed()
				.setDescription(`:track_next: ${message.author.username} skipped the current song`)
				.setColor(`#36393f`));
		}

		message.guild.music.dispatcher.end();
	}
};