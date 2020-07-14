const Discord = require('discord.js');
const index = require(`../../index.js`);

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
				.setColor(`#0083FF`));
			message.member.voice.channel.join()
				.then(connection => {
					sent.edit(new Discord.MessageEmbed()
						.setDescription(`:arrow_right: Connected to \`${connection.channel.name}\``)
						.setColor(`#0083FF`));
				});
		} else {
			message.channel.send(new Discord.MessageEmbed()
				.setDescription(`<:cross:729019052571492434> You are not in a voice channel`)
				.setColor(`#FF3838`));
		}
	}
};