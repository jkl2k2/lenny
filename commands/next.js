const index = require(`../index.js`);
const Discord = require(`discord.js`);

async function sendDetails(input, c) {
    var musicEmbed = new Discord.RichEmbed()
        .setColor(`#00c292`)
        .setTitle(` `)
        .addField(`:information_source: **Coming up next**`, `[${input.getTitle()}](${input.getURL()})`)
        .addField(`Uploader`, `[${await input.getChannelName()}](${input.getChannelURL()})`)
        .setThumbnail(input.getThumbnail())
        .setTimestamp()
        .setFooter(`Requested by ${input.getRequesterName()}`)
    c.send(musicEmbed);
}

module.exports = {
	name: 'next',
	description: 'Displays which song is up next in queue',
	aliases: ['n'],
	// usage: '[command]',
	// cooldown: 5,
	guildOnly: true,
	execute(message, args) {
        var queue = index.getQueue();
        var nextVideo = queue[0];
        if(nextVideo != undefined) {
            sendDetails(nextVideo, message.channel);
        } else {
            let nextUndefEmbed = new Discord.RichEmbed()
                .setTitle(` `)
                .addField(`<:error:643341473772863508> No video up next`, `There is no video coming up in the queue`)
                .setColor(`#FF0000`)
            message.channel.send(nextUndefEmbed);
        }
	}
}