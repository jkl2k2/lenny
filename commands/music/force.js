const player = require(`../../modules/musicPlayer`);
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
		if (!message.member.voice.channel) {
			// If member not in VC
			return message.channel.send(new Discord.MessageEmbed()
				.setDescription(`<:cross:729019052571492434> ${message.author.username}, you are not in a voice channel`)
				.setColor(`#FF3838`));
		}

		message.channel.send(new Discord.MessageEmbed()
			.setDescription(":information_source: Attemping to unstick queue...\n\n**If this doesn't work, completely restart the music system with the \`leave\` command**")
			.setColor("#36393f"));

		player.play(message);
	}
};