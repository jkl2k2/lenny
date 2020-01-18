const Discord = require('discord.js');
const index = require(`../index.js`);

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
				.setTitle(` `)
				.addField(`:arrow_right: I joined your channel, ${message.author.username}`)
				.setColor(`#0083FF`)
			message.channel.send(joinEmbed);
		} else {
			let joinFailEmbed = new Discord.RichEmbed()
				.setTitle(` `)
				.addField(`<:error:643341473772863508> You are not in a voice channel`)
				.setColor(`#FF0000`)
			message.channel.send(joinFailEmbed);
		}
	}
}