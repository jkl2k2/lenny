const Discord = require('discord.js');
const index = require(`../index.js`);

module.exports = {
	name: 'join',
	description: `Joins the user's voice channel`,
	aliases: ['j'],
	// usage: '[usage]',
	// cooldown: seconds,
	guildOnly: true,
	enabled: true,
	async execute(message, args) {
		if (message.member.voiceChannel) {
			var sent = await message.channel.send(new Discord.RichEmbed()
				.setDescription(`:arrows_counterclockwise: Connecting to ${message.member.voiceChannel.name}`)
				.setColor(`#0083FF`));
			message.member.voiceChannel.join()
				.then(connection => {
					sent.edit(new Discord.RichEmbed()
						.setDescription(`:arrow_right: Connected to ${connection.channel.name}`)
						.setColor(`#0083FF`));
				});
		} else {
			message.channel.send(new Discord.RichEmbed()
				.setDescription(`<:error:643341473772863508> You are not in a voice channel`)
				.setColor(`#FF0000`));
		}
	}
};