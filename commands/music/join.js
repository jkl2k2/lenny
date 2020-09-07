const Discord = require('discord.js');

module.exports = {
	name: 'join',
	description: `Joins the user's voice channel`,
	aliases: ['j'],
	// usage: '[usage]',
	// cooldown: seconds,
	guildOnly: true,
	enabled: true,
	type: 'music',
	async execute(message, args) {
		if (message.member.voice.channel) {
			var sent = await message.channel.send(new Discord.MessageEmbed()
				.setDescription(`:arrows_counterclockwise: Connecting to \`${message.member.voice.channel.name}\``)
				.setColor(`#36393f`));
			message.member.voice.channel.join()
				.then(connection => {
					sent.edit(new Discord.MessageEmbed()
						.setDescription(`:arrow_right: Connected to \`${connection.channel.name}\``)
						.setColor(`#36393f`));
				});
		} else {
			message.channel.send(new Discord.MessageEmbed()
				.setDescription(`<:cross:729019052571492434> You are not in a voice channel`)
				.setColor(`#FF3838`));
		}
	}
};