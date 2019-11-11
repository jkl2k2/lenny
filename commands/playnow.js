const index = require(`../index.js`);
// Any 'require'

module.exports = {
	name: 'playnow',
	description: 'Immediately skips the current song and plays the requested one',
	aliases: ['now', 'pnow'],
	usage: '[video]',
	// cooldown: 5,
	guildOnly: true,
	execute(message, args) {
		// index.playCommand("playnow", message, args);
	}
}