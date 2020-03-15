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

		var connections = client.voiceConnections.array();

		if (connections[0] != undefined) {
			connections[0].disconnect();

			let leaveEmbed = new Discord.RichEmbed()

				.setDescription(`:arrow_left: Disconnected from "${connections[0].channel.name}"`)
				.setColor(`#0083FF`);

			message.channel.send(leaveEmbed);
		} else {
			let leaveFailEmbed = new Discord.RichEmbed()

				.setDescription(`<:error:643341473772863508> I'm not in a voice channel`)
				.setColor(`#FF0000`);

			message.channel.send(leaveFailEmbed);
		}
	}
};