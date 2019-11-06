const index = require(`C:\\Users\\Joshua\\Desktop\\Programming Stuff\\L-Bot Files\\L-Bot-Rewrite\\index.js`);

module.exports = {
	name: 'skip',
	description: 'Skips the current song',
	// aliases: ['aliases'],
	usage: '[command]',
	// cooldown: 5,
	execute(message, args) {
        index.endDispatcher(message.channel, message.author.username, "skip");
    }
}