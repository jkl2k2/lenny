const index = require(`../index.js`);
const Discord = require(`discord.js`);

module.exports = {
	name: 'skipall',
	description: 'Empties the queue and skips the current song',
	aliases: ['sa', 'skipa'],
	// usage: '[command]',
	// cooldown: 5,
	guildOnly: true,
	execute(message, args) {
		
		var dispatcher = index.getDispatcher();

		if (dispatcher == undefined || dispatcher.speaking == false) {
			let skipFailEmbed = new Discord.RichEmbed()
				.setTitle(` `)
				.addField(`<:error:643341473772863508> Skipall failed`, `There is nothing to skip`)
				.setColor(`#FF0000`)
			message.channel.send(skipFailEmbed);

			return;
		}

		index.setQueue([]);
		index.endDispatcher();

		let endDispatcherEmbed = new Discord.RichEmbed()
			.setTitle(` `)
			.addField(`:fast_forward: Skipped all songs`, `${message.author.username} skipped all songs in queue`)
			.setColor(`#44C408`)
		message.channel.send(endDispatcherEmbed);

	}
}