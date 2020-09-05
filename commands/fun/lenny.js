const index = require(`../../index.js`);
// Any 'require'

module.exports = {
	name: 'lenny',
	description: 'Sends a lenny face',
	// aliases: ['aliases'],
	// usage: '[command]',
	// cooldown: 5,
	// guildOnly: true,
	enabled: true,
	type: 'fun',
	execute(message, args) {
		message.delete();
		message.channel.send(`( ͡° ͜ʖ ͡°)`);
		message.channel.send(`test`);
	}
};