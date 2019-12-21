const index = require(`../index.js`);
// Any 'require'

module.exports = {
	name: 'playing',
	description: 'Shows the currently playing song',
	// aliases: ['aliases'],
	// usage: '[command]',
	// cooldown: 5,
	guildOnly: true,
	execute(message, args) {
		message.channel.send(index.getPlaying());
	}
}