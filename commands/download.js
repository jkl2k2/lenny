const index = require(`../index.js`);
const Discord = require(`discord.js`);
var fs = require('fs');
const youtubedl = require('youtube-dl');
const config = require("config");
const ownerID = config.get("Users.ownerID");
const logger = index.getLogger();

const readline = require(`readline`);
const path = require(`path`);
const ffmpeg = require(`fluent-ffmpeg`);
const ytdl = require(`ytdl-core`);

const audioOutput = path.resolve(`F:\\Bot\\L-Bot-Rewrite\\downloads`, 'sound.mp4');
const mainOutput = path.resolve(`F:\\Bot\\L-Bot-Rewrite\\downloads`, 'output.mp4');
const secondaryAudioOutput = path.resolve(`F:\\Bot\\L-Bot-Rewrite\\downloads`, 'audio.mp4');

module.exports = {
    name: 'download',
    description: 'Downloads a YouTube video and saves it to a file',
    aliases: ['dl'],
    usage: '[url]',
    // cooldown: 5,
    // guildOnly: true,
    async execute(message, args) {
        if (message.author.id != ownerID) {
            return;
        }

        var progressEmbed = new Discord.RichEmbed()
            .setDescription(`:arrows_counterclockwise: Downloading audio`)
            .setColor(`#0083FF`)
        var progressMsg = await message.channel.send(progressEmbed);

        const onProgress = (chunkLength, downloaded, total) => {
            const percent = downloaded / total;
            readline.cursorTo(process.stdout, 0);
            process.stdout.write(`${(percent * 100).toFixed(2)}% downloaded `);
            process.stdout.write(`(${(downloaded / 1024 / 1024).toFixed(2)}MB of ${(total / 1024 / 1024).toFixed(2)}MB)`);
            if ((downloaded / total) == 1) {
                // When 100% downloaded
                let progressEmbed = new Discord.RichEmbed()
                    .setDescription(`:arrow_double_up: Uploading file...`)
                    .setColor(`#0083FF`)
                progressMsg.edit(progressEmbed);
                setTimeout(() => {
                    message.channel.send(`File:`, { files: [`./downloads/audio.mp4`] });
                }, 1000);
            }
        };

        var video;

        if (args[0] == "audio") {
            // video = youtubedl(args[1], ["-f 140"]);
            ytdl(args[1], {
                filter: format => format.container === 'mp4' && !format.qualityLabel,
                // quality: "highestaudio",
                highWaterMark: 1 << 25
            }).on('error', logger.error)
                .on('progress', onProgress)
                .pipe(fs.createWriteStream(secondaryAudioOutput))
        } else if (args[0] == "video") {
            logger.debug('Downloading audio track');

            ytdl(args[0], {
                // filter: format => format.container === 'mp4' && !format.qualityLabel,
                quality: "highestaudio"
            }).on('error', console.error)
                .on('progress', onProgress)
                .pipe(fs.createWriteStream(audioOutput))
                .on('finish', () => {
                    console.log('\nDownloading video...');
                    const video = ytdl(args[0], {
                        // filter: format => format.container === 'mp4' && !format.audioEncoding,
                        quality: 137
                    });
                    video.on('progress', onProgress);
                    ffmpeg()
                        .input(video)
                        .videoCodec('copy')
                        .input(audioOutput)
                        .audioCodec('copy')
                        .save(mainOutput)
                        .on('error', console.error)
                        .on('end', () => {
                            fs.unlink(audioOutput, err => {
                                if (err) logger.error(err);
                                else logger.info('\nFinished downloading, saved to ' + mainOutput);
                            });
                        });
                });
        }

        /*
        video.on('info', function (info) {
            logger.info('Download started');
            logger.info('filename: ' + info._filename);
            logger.info('size: ' + info.size);

            video.pipe(fs.createWriteStream(`./downloads/${info._filename}`));
        });
        */
    }
}