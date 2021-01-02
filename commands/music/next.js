const Discord = require(`discord.js`);

//#region Music info message sending
async function sendDetails(input, c) {
    if (input.getType() == "livestream") {
        // Construct embed
        let musicEmbed = new Discord.MessageEmbed()
            .setAuthor(`Coming up next`, await input.getChannelThumbnail())
            .setDescription(`**[${input.getTitle()}](${input.getURL()})**\n[${input.getChannelName()}](${input.getChannelURL()})\n\n\`YouTube Livestream\``)
            .setThumbnail(input.getThumbnail())
            .setTimestamp()
            .setFooter(`Requested by ${input.getRequesterName()}`, input.getRequesterAvatar())
            .setColor(`#36393f`);
        // Send message
        c.send(musicEmbed);
        // Set last embed
        input.getRequester().guild.music.lastEmbed = musicEmbed;
    } else {
        // Construct embed
        let musicEmbed = new Discord.MessageEmbed()
            .setAuthor(`Coming up next`, await input.getChannelThumbnail())
            .setDescription(`**[${input.getTitle()}](${input.getURL()})**\n[${input.getChannelName()}](${input.getChannelURL()})\n\nLength: \`${await input.getLength()}\``)
            .setThumbnail(input.getThumbnail())
            .setTimestamp()
            .setFooter(`Requested by ${input.getRequesterName()}`, input.getRequesterAvatar())
            .setColor(`#36393f`);
        // Send message
        c.send(musicEmbed);
        // Set last embed
        input.getRequester().guild.music.lastEmbed = musicEmbed;
    }
}
//#endregion

module.exports = {
    name: 'next',
    description: 'Displays info on which song is up next in queue',
    aliases: ['n'],
    // usage: '[command]',
    // cooldown: 5,
    guildOnly: true,
    enabled: true,
    type: 'music',
    execute(message, args) {
        let queue = message.guild.music.queue;

        if (queue == undefined) {
            return message.channel.send(new Discord.MessageEmbed()
                .setDescription(`:information_source: There is no video coming up in the queue`)
                .setColor(`#36393f`));
        }

        if (queue[0] != undefined) {
            sendDetails(queue[0], message.channel);
        } else {
            message.channel.send(new Discord.MessageEmbed()
                .setDescription(`:information_source: There is no video coming up in the queue`)
                .setColor(`#36393f`));
        }
    }
};