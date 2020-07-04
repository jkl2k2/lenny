const Discord = require('discord.js');
const index = require(`../../index.js`);
var client = index.getClient();

module.exports = {
	name: 'leave',
	description: `Leaves the user's voice channel, clearing the queue and anything that was playing`,
	aliases: ['l'],
	// usage: '[usage]',
	// cooldown: seconds,
	guildOnly: true,
	enabled: true,
	type: 'music',
	async execute(message, args) {
		if (client.voiceConnections.get(message.guild.id) != undefined) {
			let channelName = client.voiceConnections.get(message.guild.id).channel.name;
			let disconnecting = await message.channel.send(new Discord.RichEmbed()
				.setDescription(`:arrows_counterclockwise: Disconnecting from \`${channelName}`)
				.setColor(`#0083FF`));
			index.setDispatcher(message, undefined);
			index.setQueue(message, index.constructQueue());
			client.voiceConnections.get(message.guild.id).disconnect();

			disconnecting.edit(new Discord.RichEmbed()
				.setDescription(`:arrow_left: Disconnected from \`${channelName}\``)
				.setColor(`#0083FF`));
		} else {
			message.channel.send(new Discord.RichEmbed()
				.setDescription(`<:cross:729019052571492434> I'm not in a voice channel`)
				.setColor(`#FF3838`));
		}
	}
};