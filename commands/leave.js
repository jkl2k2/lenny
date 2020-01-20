const Discord = require('discord.js');
const index = require(`../index.js`);
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
				.setDescription(`:eject: *I left the voice channel*`)
				.setColor(`#0083FF`)

			message.channel.send(leaveEmbed);
		} else {
			let leaveFailEmbed = new Discord.RichEmbed()
				.setTitle(` `)
				.setDescription(`<:error:643341473772863508> *I'm not in a voice channel*`)
				.setColor(`#FF0000`)

			message.channel.send(leaveFailEmbed);
		}
	}
}