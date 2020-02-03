const Discord = require('discord.js');

module.exports = {
	name: 'ping',
	description: 'Performs a latency test and shows the results',
	aliases: ['test'],
	// usage: '[command]',
	// cooldown: 5,
	guildOnly: false,
	async execute(message, args) {
		let pingEmbed = new Discord.RichEmbed()
			.setTitle(` `)
			.setDescription(`:arrows_counterclockwise: Testing latency...`)
			.addField(`Frontend Latency`, `Testing...`, true)
			.addField(`Frontend Status`, `:arrows_counterclockwise: Testing...`, true)
			.addBlankField()
			.addField(`Discord API Latency`, `Testing...`, true)
			.addField(`Discord API Status`, `:arrows_counterclockwise: Testing...`, true)
			.setColor(`#0083FF`)

		const m = await message.channel.send(pingEmbed);

		let newPingEmbed = new Discord.RichEmbed()
			.setTitle(` `)
			.setDescription(`:information_source: Latency Test Completed`)
			.setColor(`#0083FF`);
		
		newPingEmbed.addField(`Frontend Latency`, `${m.createdTimestamp - message.createdTimestamp}ms`, true)
		if ((m.createdTimestamp - message.createdTimestamp) < 300) newPingEmbed.addField(`Frontend Status`, `:white_check_mark: Appears normal`, true);
		if ((m.createdTimestamp - message.createdTimestamp) >= 300) newPingEmbed.addField(`Frontend Status`, `:warning: Frontend is lagging`, true);
		newPingEmbed.addBlankField();
		newPingEmbed.addField(`Discord API Latency`, `${Math.round(message.client.ping)}ms`, true);
		if (Math.round(message.client.ping) < 100) newPingEmbed.addField(`Discord API Status`, `:white_check_mark: Appears normal`, true);
		if (Math.round(message.client.ping) >= 100) newPingEmbed.addField(`Discord API Status`, `:warning: Discord is lagging`, true);

		m.edit(newPingEmbed);
	},
};