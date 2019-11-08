const index = require(`C:\\Users\\Joshua\\Desktop\\Programming Stuff\\L-Bot Files\\L-Bot-Rewrite\\index.js`);
// Any 'require'

module.exports = {
	name: 'shuffle',
	description: 'Shuffles the music queue',
	// aliases: ['aliases'],
	// usage: '[command]',
	// cooldown: 5,
	guildOnly: true,
	execute(message, args) {
		index.shuffleQueue(message);
	}
}