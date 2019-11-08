const Discord = require('discord.js');

module.exports = {
	name: 'ping',
	description: 'Performs a latency test and shows the results',
	async execute(message, args) {
		let pingEmbed = new Discord.RichEmbed()
			.setTitle(`:arrows_counterclockwise: Testing latency...`)
			.setColor(`#0083FF`)

		const m = await message.channel.send(pingEmbed);

		let newPingEmbed = new Discord.RichEmbed()
			.setTitle(`:white_check_mark: Latency Test Completed`)
			.setColor(`#44C408`)
			.addField(`Frontend Latency`, `${m.createdTimestamp - message.createdTimestamp}ms`)
			.addField(`Discord API Latency`, `${Math.round(message.client.ping)}ms`)

		m.edit(newPingEmbed);
	},
};