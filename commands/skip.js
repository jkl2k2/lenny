const index = require(`C:\\Users\\Joshua\\Desktop\\Programming Stuff\\L-Bot Files\\L-Bot-Rewrite\\index.js`);

module.exports = {
	name: 'skip',
	description: 'Skips the current song',
	// aliases: ['aliases'],
	// usage: '[command]',
	// cooldown: 5,
	guildOnly: true,
	execute(message, args) {
        index.callEndDispatcher(message.channel, message.author.username, "skip");
    }
}