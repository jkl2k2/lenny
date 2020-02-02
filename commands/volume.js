const index = require(`../index.js`);
const config = require('config');
const jahyID = config.get(`Users.jahyID`);
const Discord = require(`discord.js`);

function decideWording(input) {
	if (input == true) {
		return "raised volume to";
	} else if (input == false) {
		return "lowered volume to";
	} else {
		return "kept the volume at";
	}
}

function compareVolume(volume) {
	if (volume / 100 > index.getVolume()) {
		return true;
	} else if (volume / 100 < index.getVolume()) {
		return false;
	} else if (volume / 100 == index.getVolume()) {
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
	execute(message, args) {
		volume = args[0];
		raisedVolume = compareVolume(volume);

		var newVolume = volume / 100;
		if ((volume >= 0 && volume <= 500) || message.author.id == jahyID) {
			index.setDispatcherVolume(newVolume);
			let vEmbed = new Discord.RichEmbed()
				.setTitle(` `)
				.setDescription(`:loud_sound: ${message.author.username} ${decideWording(raisedVolume)} ${volume}%`)
				.setColor(`#44C408`)
			message.channel.send(vEmbed);
		} else {
			let vEmbed = new Discord.RichEmbed()
				.setTitle(` `)
				.addField(`<:error:643341473772863508> Failed to change volume`, `You can't set the volume to that number`)
				.setColor(`#FF0000`)
			message.channel.send(vEmbed);
		}
	}
}