const index = require(`../index.js`);
// Any 'require'

module.exports = {
	name: 'owo',
	description: 'HUSTLE MY BONES',
	// aliases: ['aliases'],
	// usage: '[command]',
	// cooldown: 5,
	// guildOnly: true,
	enabled: true,
	execute(message, args) {
		if (index.getOwoToggle() == true) {
			message.channel.send(`Hustle Bones Jul 21, 2018 @ 12:11pm\nJust me and my :two_hearts:daddy:two_hearts:, hanging out I got pretty hungry:eggplant: so I started to pout :disappointed: He asked if I was down :arrow_down:`, { tts: true });
			message.channel.send(`for something yummy :heart_eyes::eggplant: and I asked what and he said he'd give me his :sweat_drops:cummies!:sweat_drops: Yeah! Yeah!:two_hearts::sweat_drops:`, { tts: true });
			message.channel.send(`I drink them!:sweat_drops: I slurp them!:sweat_drops: I swallow them whole:sweat_drops:`, { tts: true });
			message.channel.send(`:heart_eyes: It makes :cupid:daddy:cupid: :blush:happy:blush: so it's my only goal... :two_hearts::sweat_drops::tired_face:Harder daddy! Harder daddy! :tired_face::sweat_drops::two_hearts:`, { tts: true });
			message.channel.send(`1 cummy:sweat_drops:, 2 cummy:sweat_drops::sweat_drops:, 3 cummy:sweat_drops::sweat_drops::sweat_drops:, 4:sweat_drops::sweat_drops::sweat_drops::sweat_drops:`, { tts: true });
			message.channel.send(`I'm :cupid:daddy's:cupid: :crown:princess :crown:but I'm also a :hearts::hearts::hearts::hearts::hearts:!`, { tts: true });
			message.channel.send(`:heart_decoration: He makes me feel squishy:heartpulse:!He makes me feel good:purple_heart:! :cupid::cupid::cupid:He makes me feel everything a little should!~ :cupid::cupid::cupid:`, { tts: true });
			message.channel.send(`:crown::sweat_drops::cupid:Wa-What!:cupid::sweat_drops::crown:`, { tts: true });
		}
	}
};