const Discord = require('discord.js');
const index = require(`C:\\Users\\Joshua\\Desktop\\Programming Stuff\\L-Bot Files\\L-Bot-Rewrite\\index.js`);

module.exports = {
	name: 'join',
	description: `Joins the user's voice channel`,
	aliases: ['j'],
	// usage: '[usage]',
	// cooldown: seconds,
	guildOnly: true,
	execute(message, args) {
		// index.callJoinVC(message);
		if (message.member.voiceChannel) {
			message.member.voiceChannel.join();
			let joinEmbed = new Discord.RichEmbed()
				.setTitle(`:white_check_mark: **I joined your channel, ${message.author.username}**`)
				.setColor(`#44C408`)
			message.channel.send(joinEmbed);
		} else {
			let joinFailEmbed = new Discord.RichEmbed()
				.setTitle(`:no_entry: ${message.author.username}, you are not in a voice channel`)
				.setColor(`#FF0000`)
			message.channel.send(joinFailEmbed);
		}
	}
}