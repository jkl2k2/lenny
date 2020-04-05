const index = require(`../index.js`);
const Discord = require(`discord.js`);

async function sendDetails(input, c) {
    if (input.getLength() == `unknown`) {
        let musicEmbed = new Discord.RichEmbed()
            .setAuthor(`➡️ Coming up next`)
            .setDescription(`**[${input.getTitle()}](${input.getURL()})**\nBy: [${await input.getChannelName()}](${input.getChannelURL()})`)
            .setThumbnail(input.getThumbnail())
            .setTimestamp()
            .setFooter(`Requested by ${input.getRequesterName()}`);
        c.send(musicEmbed);
    } else {
        let musicEmbed = new Discord.RichEmbed()
            .setAuthor(`➡️ Coming up next`)
            .setDescription(`**[${input.getTitle()}](${input.getURL()})**\nBy: [${await input.getChannelName()}](${input.getChannelURL()})\n\n\`<⚫——————————> (0:00/${await input.getLength()})\``)
            .setThumbnail(input.getThumbnail())
            .setTimestamp()
            .setFooter(`Requested by ${input.getRequesterName()}`);
        c.send(musicEmbed);
    }
}

module.exports = {
    name: 'next',
    description: 'Displays info on which song is up next in queue',
    aliases: ['n'],
    // usage: '[command]',
    // cooldown: 5,
    guildOnly: true,
    enabled: true,
    execute(message, args) {
        var queue = index.getQueue();
        var nextVideo = queue[0];
        if (nextVideo != undefined) {
            sendDetails(nextVideo, message.channel);
        } else {
            let nextUndefEmbed = new Discord.RichEmbed()
                .setDescription(`:information_source: There is no video coming up in the queue`)
                .setColor(`#0083FF`);
            message.channel.send(nextUndefEmbed);
        }
    }
};