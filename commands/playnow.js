const index = require(`C:\\Users\\Joshua\\Desktop\\Programming Stuff\\L-Bot Files\\L-Bot-Rewrite\\index.js`);
// Any 'require'

module.exports = {
	name: 'playnow',
	description: 'Immediately skips the current song and plays the requested one',
	aliases: ['now'],
	usage: '[video]',
	// cooldown: 5,
	execute(message, args) {
        index.playCommand("playnow", message, args);
    }
}