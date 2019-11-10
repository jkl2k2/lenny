const index = require(`C:\\Users\\Joshua\\Desktop\\Programming Stuff\\L-Bot Files\\L-Bot-Rewrite\\index.js`);
// Any 'require'

module.exports = {
	name: 'resume',
	description: 'Resumes music playback if it was paused',
	// aliases: ['aliases'],
	// usage: '[command]',
	// cooldown: 5,
	guildOnly: true,
	execute(message, args) {
		index.resumeMusic(message);
	}
}