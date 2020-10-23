const Discord = require('discord.js');

module.exports = {
	name: 'leave',
	description: `Leaves the user's voice channel, clearing the queue and anything that was playing`,
	aliases: ['l', 'disconnect', 'dc'],
	// usage: '[usage]',
	// cooldown: seconds,
	guildOnly: true,
	enabled: true,
	type: 'music',
	async execute(message, args) {
		const client = message.client;

		if (client.voice.connections.get(message.guild.id) != undefined) {
			let channelName = client.voice.connections.get(message.guild.id).channel.name;
			let disconnecting = await message.channel.send(new Discord.MessageEmbed()
				.setDescription(`:arrows_counterclockwise: Disconnecting from \`${channelName}\``)
				.setColor(`#36393f`));

			// Empty queue
			message.guild.music.queue = [];

			// End dispatcher
			if (message.guild.music.dispatcher != undefined) {
				message.guild.music.dispatcher.end();
			}

			// Empty dispatcher
			// message.guild.music.dispatcher = undefined;

			// Disconnect from VC
			client.voice.connections.get(message.guild.id).disconnect();

			// Reset playing
			message.guild.music.playing = false;

			disconnecting.edit(new Discord.MessageEmbed()
				.setDescription(`:arrow_left: Disconnected from \`${channelName}\``)
				.setColor(`#36393f`));
		} else {
			message.channel.send(new Discord.MessageEmbed()
				.setDescription(`<:cross:729019052571492434> I'm not in a voice channel`)
				.setColor(`#FF3838`));
		}
	}
};