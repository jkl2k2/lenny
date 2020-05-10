const index = require(`../../index.js`);
const config = require('config');
const jahyID = config.get(`Users.jahyID`);
const Discord = require(`discord.js`);

function decideWording(input) {
	if (input == true) {
		return " raised volume to";
	} else if (input == false) {
		return " lowered volume to";
	} else {
		return ", the volume is already at";
	}
}

function compareVolume(volume, dispatcher) {
	if (volume / 100 > dispatcher.volume) {
		return true;
	} else if (volume / 100 < dispatcher.volume) {
		return false;
	} else if (volume / 100 == dispatcher.volume) {
		return "equal";
	} else {
		return "catch";
	}
}

module.exports = {
	name: 'volume',
	description: 'Changes the volume of music playback',
	aliases: ['v', 'vol'],
	usage: '[volume]',
	// cooldown: 5,
	guildOnly: true,
	enabled: true,
	type: 'music',
	execute(message, args) {
		if (!args.length) {
			if (index.getDispatcher(message) == undefined) {
				let currentVol = new Discord.RichEmbed()
					.setDescription(`:loud_sound: Current volume: 100%`)
					.setColor(`#0083FF`);

				return message.channel.send(currentVol);
			}
			return message.channel.send(new Discord.RichEmbed()
				.setDescription(`:loud_sound: Current volume: \`${(index.getDispatcher(message).volume) * 100}%\``)
				.setColor(`#0083FF`));
		}

		volume = args[0];
		var dispatcher = index.getDispatcher(message);
		var queue = index.getQueue(message);
		if (dispatcher == undefined || queue == undefined) {
			return message.channel.send(new Discord.RichEmbed()
				.setDescription(`:information_source: Nothing is currently playing`)
				.setColor(`#0083FF`));
		}
		raisedVolume = compareVolume(volume, dispatcher);

		var newVolume = volume / 100;
		if ((volume >= 0 && volume <= 500) || message.author.id == jahyID) {
			dispatcher.setVolume(newVolume);
			queue.volume = newVolume;
			return message.channel.send(new Discord.RichEmbed()
				.setDescription(`:loud_sound: ${message.author.username}${decideWording(raisedVolume)} \`${volume}%\``)
				.setColor(`#0083FF`));
		} else {
			return message.channel.send(new Discord.RichEmbed()
				.addField(`<:error:643341473772863508> Failed to change volume`, `You can't set the volume to that number`)
				.setColor(`#FF0000`));
		}
	}
};