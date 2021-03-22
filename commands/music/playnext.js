const queueHandler = require(`../../modules/queueHandler`);

module.exports = {
	name: 'playnext',
	description: 'Plays videos from YouTube, either by search or URL, but places the song at the top of the queue',
	aliases: ['pn', 'playn', 'pnext'],
	args: true,
	usage: '[search term(s) or URL]',
	cooldown: 3,
	guildOnly: true,
	enabled: true,
	type: 'music',
	execute(message, args) {
		queueHandler.queue(message, args, `playnext`);
	}
};