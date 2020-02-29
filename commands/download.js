const index = require(`../index.js`);
var fs = require('fs');
const youtubedl = require('youtube-dl');
const config = require("config");
const ownerID = config.get("Users.ownerID");
const logger = index.getLogger();

module.exports = {
    name: 'download',
    description: 'Downloads a YouTube video and saves it to a file',
    aliases: ['dl'],
    usage: '[url]',
    // cooldown: 5,
    // guildOnly: true,
    execute(message, args) {
        if(message.author.id != ownerID) {
            return;
        }

        var video;

        if(args[1]) {
            video = youtubedl(args[1], ["-f 140"]);
        } else {
            video = youtubedl(args[0]);
        }

        video.on('info', function (info) {
            logger.info('Download started');
            logger.info('filename: ' + info._filename);
            logger.info('size: ' + info.size);

            video.pipe(fs.createWriteStream(`./downloads/${info._filename}`));
        });
    }
}