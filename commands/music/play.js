const queueHandler = require(`../../modules/queueHandler`);

module.exports = {
	name: 'play',
	description: 'Plays videos from YouTube or SoundCloud',
	aliases: ['p'],
	args: true,
	usage: '[search term(s)]',
	altUsage: '[Video or playlist URL]',
	cooldown: 3,
	guildOnly: true,
	enabled: true,
	type: 'music',
	execute(message, args) {
		queueHandler.queue(message, args, `play`);
	}
};