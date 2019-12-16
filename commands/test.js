const index = require(`../index.js`);
const fs = require('fs');
const youtubedl = require('youtube-dl');
const Discord = require('discord.js');

module.exports = {
    name: 'test',
    description: 'Description',
    // aliases: ['aliases'],
    usage: '[command]',
    // cooldown: 5,
    async execute(message, args) {
        message.channel.send("Test message!");

        /*
        const video = youtubedl(args[0]);

        video.on('info', async function (info) {
            let scDownload = new Discord.RichEmbed()
                .setTitle(` `)
                .addField(`:arrows_counterclockwise: Downloading SoundCloud song`, `[${info._filename.substring(0, (info._filename.length) - 14)}](${info.webpage_url})`)
                .addField(`Uploader`, `[${info.uploader}](${info.uploader_url})`, true)
                .addField(`Length`, info._duration_hms.substring(3, 8), true)
                .setColor(`#0083FF`)
            message.channel.send(scDownload);
            console.log('Download started');
            console.log('filename: ' + info._filename);
            console.log('size: ' + info.size);
            
            console.log(info);
        });
        */
    }
}