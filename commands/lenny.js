const index = require(`../index.js`);
// Any 'require'

module.exports = {
	name: 'lenny',
	description: 'Sends a lenny face',
	// aliases: ['aliases'],
	// usage: '[command]',
	// cooldown: 5,
	// guildOnly: true,
	execute(message, args) {
		message.channel.send(`( ͡° ͜ʖ ͡°)`);
	}
};