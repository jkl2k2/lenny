const index = require(`C:\\Users\\Joshua\\Desktop\\Programming Stuff\\L-Bot Files\\L-Bot-Rewrite\\index.js`);

module.exports = {
	name: 'queue',
	description: 'Returns the current music queue (up to 5 songs)',
	// aliases: ['aliases'],
	// usage: '[command]',
	// cooldown: 5,
	guildOnly: true,
	execute(message, args) {
        index.viewQueue();
    }
}