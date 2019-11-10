const index = require(`C:\\Users\\Joshua\\Desktop\\Programming Stuff\\L-Bot Files\\L-Bot-Rewrite\\index.js`);
// Any 'require'

module.exports = {
	name: 'pause',
	description: 'Pauses music playback if it wasn\'t already',
	// aliases: ['aliases'],
	// usage: '[command]',
	// cooldown: 5,
	guildOnly: true,
	execute(message, args) {
		index.pauseMusic(message);
	}
}