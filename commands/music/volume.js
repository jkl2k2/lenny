const config = require('config');
const jahyID = config.get(`Users.jahyID`);
const ownerID = config.get(`Users.ownerID`);
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
			if (message.guild.music.dispatcher == undefined) {
				return message.channel.send(new Discord.MessageEmbed()
					.setDescription(`:loud_sound: Current volume: 100%`)
					.setColor(`#36393f`));
			}
			return message.channel.send(new Discord.MessageEmbed()
				.setDescription(`:loud_sound: Current volume: \`${(message.guild.music.volume) * 100}%\``)
				.setColor(`#36393f`));
		}

		volume = args[0];
		let dispatcher = message.guild.music.dispatcher;
		if (!message.guild.music.playing) {
			return message.channel.send(new Discord.MessageEmbed()
				.setDescription(`:information_source: Nothing is currently playing`)
				.setColor(`#36393f`));
		}
		raisedVolume = compareVolume(volume, dispatcher);

		let newVolume = volume / 100;
		if ((volume >= 0 && volume <= 500) || message.author.id == jahyID || message.author.id == ownerID) {
			dispatcher.setVolume(newVolume);
			message.guild.music.volume = newVolume;
			return message.channel.send(new Discord.MessageEmbed()
				.setDescription(`:loud_sound: ${message.author.username}${decideWording(raisedVolume)} \`${volume}%\``)
				.setColor(`#36393f`));
		} else {
			return message.channel.send(new Discord.MessageEmbed()
				.addField(`<:cross:729019052571492434> Failed to change volume`, `You can't set the volume to that number`)
				.setColor(`#FF3838`));
		}
	}
};