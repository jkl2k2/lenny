const Discord = require('discord.js');
const index = require(`C:\\Users\\Joshua\\Desktop\\Programming Stuff\\L-Bot Files\\L-Bot-Rewrite\\index.js`);
var client = index.getClient();

module.exports = {
	name: 'leave',
	description: `Leaves the user's voice channel`,
	aliases: ['l'],
	// usage: '[usage]',
	// cooldown: seconds,
	guildOnly: true,
	execute(message, args) {

		var connectionArray = client.voiceConnections.array();

		if (connectionArray[0] != undefined) {
			connectionArray[0].disconnect();

			let leaveEmbed = new Discord.RichEmbed()
				.setTitle(` `)
				.addField(`:white_check_mark: Left voice channel`, `I left the voice channel`)
				.setColor(`#44C408`)

			message.channel.send(leaveEmbed);
		} else {
			let leaveFailEmbed = new Discord.RichEmbed()
				.setTitle(` `)
				.addField(`<:error:643341473772863508> Failed to leave`, `I'm not in a voice channel`)
				.setColor(`#FF0000`)

			message.channel.send(leaveFailEmbed);
		}
	}
}