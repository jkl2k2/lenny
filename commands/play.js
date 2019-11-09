const index = require(`C:\\Users\\Joshua\\Desktop\\Programming Stuff\\L-Bot Files\\L-Bot-Rewrite\\index.js`);

module.exports = {
	name: 'play',
	description: 'Plays videos from YouTube, either by search or URL',
	aliases: ['p'],
	usage: '[search term(s) or URL]',
	// cooldown: 5,
	guildOnly: true,
	execute(message, args) {
		args.unshift();
		console.log(args);
		index.playCommand("play", message, args)
	}
}