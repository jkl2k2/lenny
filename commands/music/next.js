const index = require(`../../index.js`);
const Discord = require(`discord.js`);
const Queues = index.getQueues();
const fetch = require(`node-fetch`);
const hex = require(`rgb-hex`);
const colorThief = require(`colorthief`);

async function sendDetails(input, c, index) {
    if (await input.getLength() == `unknown`) {
        let buffer = await fetch(input.getThumbnail()).then(r => r.buffer()).then(buf => `data:image/jpg;base64,` + buf.toString('base64'));
        let rgb = await colorThief.getColor(buffer);
        c.send(new Discord.MessageEmbed()
            .setAuthor(`Coming up next`, await input.getChannelThumbnail())
            .setDescription(`**[${input.getTitle()}](${input.getURL()})**\n[${await input.getChannelName()}](${input.getChannelURL()})\n\n\`Length not provided by YouTube\``)
            .setThumbnail(input.getThumbnail())
            .setTimestamp()
            .setFooter(`Requested by ${input.getRequesterName()}`, input.getRequesterAvatar())
            .setColor(`#${hex(rgb[0], rgb[1], rgb[2])}`));
    } else {
        let buffer = await fetch(input.getThumbnail()).then(r => r.buffer()).then(buf => `data:image/jpg;base64,` + buf.toString('base64'));
        let rgb = await colorThief.getColor(buffer);
        c.send(new Discord.MessageEmbed()
            .setAuthor(`Coming up next`, await input.getChannelThumbnail())
            .setDescription(`**[${input.getTitle()}](${input.getURL()})**\n[${await input.getChannelName()}](${input.getChannelURL()})\n\nLength: \`${await input.getLength()}\``)
            .setThumbnail(input.getThumbnail())
            .setTimestamp()
            .setFooter(`Requested by ${input.getRequesterName()}`, input.getRequesterAvatar())
            .setColor(`#${hex(rgb[0], rgb[1], rgb[2])}`));
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
    type: 'music',
    execute(message, args) {
        var queue = index.getQueue(message).list;

        if (queue == undefined) {
            return message.channel.send(new Discord.MessageEmbed()
                .setDescription(`:information_source: There is no video coming up in the queue`)
                .setColor(`#0083FF`));
        }

        if (queue[0] != undefined) {
            sendDetails(queue[0], message.channel);
        } else {
            message.channel.send(new Discord.MessageEmbed()
                .setDescription(`:information_source: There is no video coming up in the queue`)
                .setColor(`#0083FF`));
        }
    }
};