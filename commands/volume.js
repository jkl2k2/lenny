const index = require(`C:\\Users\\Joshua\\Desktop\\Programming Stuff\\L-Bot Files\\L-Bot-Rewrite\\index.js`);

module.exports = {
	name: 'volume',
	description: 'Changes the volume of music playback',
	// aliases: ['aliases'],
	usage: '[volume]',
	// cooldown: 5,
	guildOnly: true,
	execute(message, args) {
        args.unshift();
        index.changeVolume(args[0]);
    }
}