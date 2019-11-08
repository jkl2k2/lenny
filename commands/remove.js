const index = require(`C:\\Users\\Joshua\\Desktop\\Programming Stuff\\L-Bot Files\\L-Bot-Rewrite\\index.js`);
// Any 'require'

module.exports = {
	name: 'remove',
	description: 'Removes a video from the queue',
	aliases: ['queueremove'],
	usage: '[video number in queue]',
	// cooldown: 5,
	guildOnly: true,
	execute(message, args) {
        args.unshift();
        index.removeFromQueue(args[0]);
    }
}