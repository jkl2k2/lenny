const Discord = require('discord.js');

module.exports = {
	name: 'leave',
	description: `Leaves the user's voice channel`,
	// aliases: ['aliases'],
	// usage: '[usage]',
	// cooldown: seconds,
	execute(message, args) {
        /*
        if(dispatcher != undefined && dispatcher.speaking) {
			let leaveFailEmbed = new Discord.RichEmbed()
			.setTitle(`:no_entry: **I cannot leave a channel while playing music, ${message.author.username}**`)
			.setColor(`#FF0000`)
			message.channel.send(leaveFailEmbed);

			return;
        }
        */
		message.member.voiceChannel.leave();
		let leaveEmbed = new Discord.RichEmbed()
			.setTitle(`:white_check_mark: **I left your channel, ${message.author.username}**`)
			.setColor(`#44C408`)
		message.channel.send(leaveEmbed);
    }
}