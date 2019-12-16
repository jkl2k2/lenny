const index = require(`../index.js`);
var Discord = require('discord.js');
const prism = require('prism-media');
var client = index.getClient();
var fs = require('fs');
const youtubedl = require('youtube-dl');

var dispatcher;

module.exports = {
    name: 'sc',
    description: 'Soundcloud test',
    // aliases: ['aliases'],
    // usage: '[command]',
    // cooldown: 5,
    // guildOnly: true,
    async execute(message, args) {
        message.member.voiceChannel.join();
        var connectionArray = client.voiceConnections.array();

        const video = youtubedl(args[0]);

        var sent;
        var gInfo;

        // Will be called when the download starts.
        video.on('info', async function (info) {
            let scDownload = new Discord.RichEmbed()
                .setTitle(` `)
                .addField(`:arrows_counterclockwise: Downloading SoundCloud song`, `${info._filename.substring(0, (info._filename.length) - 14)}`)
                .setColor(`#0083FF`)
            message.channel.send(scDownload);
            console.log('Download started');
            console.log('filename: ' + info._filename);
            console.log('size: ' + info.size);
            gInfo = info;
        });

        video.pipe(fs.createWriteStream('./soundcloud/audio.mp3'));

        video.on('end', function () {
            let scDownloadComplete = new Discord.RichEmbed()
                .setTitle(` `)
                .addField(`:white_check_mark: Downloaded SoundCloud song`, `${gInfo._filename.substring(0, (gInfo._filename.length) - 14)} has finished downloading`)
                .setColor(`#44C408`)
            message.channel.send(scDownloadComplete);
            dispatcher = connectionArray[0].playStream(fs.createReadStream('./soundcloud/audio.mp3'));
            // dispatcher = connectionArray[0].playStream(video);
        });


        // dispatcher = connectionArray[0].playStream(video);
        // dispatcher = connectionArray[0].playConvertedStream(pcm);
    }
}