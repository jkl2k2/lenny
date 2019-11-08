const index = require(`C:\\Users\\Joshua\\Desktop\\Programming Stuff\\L-Bot Files\\L-Bot-Rewrite\\index.js`);
// Any 'require'

module.exports = {
	name: 'playnext',
	description: 'Processes a video and places it next in queue',
	aliases: ['next'],
	usage: '[video]',
	// cooldown: 5,
	execute(message, args) {
        index.playCommand("playnext", message, args);
    }
}