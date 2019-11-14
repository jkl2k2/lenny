const index = require(`../index.js`);
// Any 'require'

module.exports = {
	name: 'say',
	description: 'Repeats a message with TTS enabled',
	// aliases: ['aliases'],
	usage: '[message]',
	// cooldown: 5,
	guildOnly: true,
	execute(message, args) {
		message.channel.send(args.join(" "), { tts: true });
	}
}