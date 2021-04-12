const queueHandler = require(`../../modules/queueHandler`);

module.exports = {
	name: 'playnow',
	description: 'Immediately skips the current song and plays the requested one',
	args: true,
	aliases: ['now', 'pnow'],
	usage: '[video]',
	// cooldown: 5,
	guildOnly: true,
	enabled: true,
	type: 'music',
	execute(message, args) {
		queueHandler.queue(message, args, `playnow`);
	}
};