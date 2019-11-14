const index = require(`../index.js`);
const Discord = require(`discord.js`);
// Any 'require'

module.exports = {
	name: 'playnow',
	description: 'Immediately skips the current song and plays the requested one',
	aliases: ['now', 'pnow'],
	usage: '[video]',
	// cooldown: 5,
	guildOnly: true,
	execute(message, args) {
		// index.playCommand("playnow", message, args);
		let disabledEmbed = new Discord.RichEmbed()
			.setTitle(` `)
			.addField(`<:error:643341473772863508> Command disabled`, `Sorry, "playnow" is disabled right now`)
			.setColor(`#FF0000`)
		message.channel.send(disabledEmbed);
	}
}