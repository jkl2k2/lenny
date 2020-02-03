const index = require(`../index.js`);
const Discord = require(`discord.js`);

module.exports = {
	name: 'force',
	description: 'Attempts to force playback from a stuck queue',
	// aliases: ['aliases'],
	// usage: '[command]',
	cooldown: 5,
	guildOnly: true,
	execute(message, args) {
        let forceEmbed = new Discord.RichEmbed()
            .setTitle(" ")
            .addField(":information_source: Forcing playback", "Attemping to unstick queue...")
            .setColor("#0083FF")
		message.channel.send(forceEmbed);
		
		index.callPlayMusic();
	}
}