const Discord = require('discord.js');

module.exports = {
	name: 'ping',
	description: 'Performs a latency test and shows the results',
	aliases: ['test'],
	// usage: '[command]',
	// cooldown: 5,
	// guildOnly: false,
	enabled: true,
	type: 'general',
	async execute(message, args) {
		const m = await message.channel.send(new Discord.MessageEmbed()
			.addField(`:clock3: Message Edit Latency`, `\`Testing...\``)
			.addField(`:heartbeat: Discord API Ping`, `\`Testing...\``)
			.setColor(`#36393f`));

		var frontendLatency = (m.createdTimestamp - message.createdTimestamp);
		var roundedPing = Math.round(message.client.ws.ping);

		m.edit(new Discord.MessageEmbed()
			.setColor(`#36393f`)
			.addField(`:clock3: Message Edit Latency`, `\`${frontendLatency}ms\``)
			.addField(`:heartbeat: Discord API Ping`, `\`${roundedPing}ms\``));
	},
};