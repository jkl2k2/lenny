const index = require(`../../index.js`);
const Discord = require(`discord.js`);

module.exports = {
	name: 'force',
	description: 'Attempts to force playback from a stuck queue',
	// aliases: ['aliases'],
	// usage: '[command]',
	cooldown: 5,
	guildOnly: true,
	enabled: true,
	type: 'music',
	execute(message, args) {
		message.channel.send(new Discord.MessageEmbed()
			.setDescription(":information_source: Attemping to unstick queue...\n\n**If this doesn't work, completely restart the music system with the \`leave\` command**")
			.setColor("#0083FF"));

		index.callPlayMusic(message);
	}
};