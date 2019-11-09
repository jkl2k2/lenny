const index = require(`C:\\Users\\Joshua\\Desktop\\Programming Stuff\\L-Bot Files\\L-Bot-Rewrite\\index.js`);

module.exports = {
	name: 'skipall',
	description: 'Empties the queue and skips the current song',
	aliases: ['sa', 'skipa'],
	// usage: '[command]',
	// cooldown: 5,
	guildOnly: true,
	execute(message, args) {
		index.callEndDispatcher(message.channel, message.author.username, "skipall");
	}
}