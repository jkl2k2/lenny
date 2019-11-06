const index = require(`C:\\Users\\Joshua\\Desktop\\Programming Stuff\\L-Bot Files\\L-Bot-Rewrite\\index.js`);

module.exports = {
	name: 'play',
	description: 'plays stuff',
	// aliases: ['aliases'],
	usage: '[command]',
	// cooldown: 5,
	execute(message, args) {
        args.unshift();
        console.log(args);
        index.playCommand("play", message, args)
    }
}