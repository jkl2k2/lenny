const Discord = require('discord.js');
const index = require(`../../index.js`);
var client = index.getClient();

module.exports = {
	name: 'leave',
	description: `Leaves the user's voice channel`,
	aliases: ['l'],
	// usage: '[usage]',
	// cooldown: seconds,
	guildOnly: true,
	enabled: true,
	type: 'music',
	execute(message, args) {
		if (client.voiceConnections.get(message.guild.id) != undefined) {
			message.channel.send(new Discord.RichEmbed()
				.setDescription(`:arrow_left: Disconnected from ${client.voiceConnections.get(message.guild.id).channel.name}`)
				.setColor(`#0083FF`));

			client.voiceConnections.get(message.guild.id).disconnect();
		} else {
			message.channel.send(new Discord.RichEmbed()

				.setDescription(`<:error:643341473772863508> I'm not in a voice channel`)
				.setColor(`#FF0000`));
		}
	}
};