const Discord = require('discord.js');

module.exports = {
	name: 'join',
	description: `Joins the user's voice channel`,
	// aliases: ['aliases'],
	usage: '[join]',
	// cooldown: seconds,
	execute(message, args) {
        if(message.member.voiceChannel) {
            let joinEmbed = new Discord.RichEmbed()
                .setTitle(`:white_check_mark: **I joined your channel, ${message.author.username}**`)
                .setColor(`#44C408`)
            message.channel.send(joinEmbed);
        } else {
            message.channel.send(`:eyes: ${message.author}, I can't join your VC if you're not in a VC, ya doofus`);
        }
    }
}