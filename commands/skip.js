const index = require(`C:\\Users\\Joshua\\Desktop\\Programming Stuff\\L-Bot Files\\L-Bot-Rewrite\\index.js`);
const Discord = require(`discord.js`);

module.exports = {
	name: 'skip',
	description: 'Skips the current song',
	aliases: ['skip'],
	// usage: '[command]',
	// cooldown: 5,
	guildOnly: true,
	execute(message, args) {
		// index.callEndDispatcher(message.channel, message.author.username, "skip");

		var dispatcher = index.getDispatcher();

		if (dispatcher == undefined || dispatcher.speaking == false) {
			let skipFailEmbed = new Discord.RichEmbed()
				.setTitle(` `)
				.addField(`<:error:643341473772863508> Skip failed`, `There is nothing to skip`)
				.setColor(`#FF0000`)
			message.channel.send(skipFailEmbed);

			return;
		}

		index.endDispatcher();

		let endDispatcherEmbed = new Discord.RichEmbed()
			.setTitle(` `)
			.addField(`:fast_forward: Skipped song`, `${message.author.username} skipped the current song`)
			.setColor(`#44C408`)
		message.channel.send(endDispatcherEmbed);

	}
}