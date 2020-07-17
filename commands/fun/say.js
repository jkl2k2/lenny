const index = require(`../../index.js`);
const { Util } = require("discord.js");
// Any 'require'

module.exports = {
	name: 'say',
	description: 'Repeats a message with TTS enabled',
	// aliases: ['aliases'],
	usage: '[message]',
	// cooldown: 5,
	guildOnly: true,
	enabled: true,
	type: 'fun',
	execute(message, args) {
		message.channel.send(Util.removeMentions(args.join(" ")), { tts: true });
	}
};