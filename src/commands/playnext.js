const { Command } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);
const queueHandler = require(`../modules/queueHandler`);

class PlayNextCommand extends Command {
    constructor() {
        super(`playnext`, {
            aliases: [`playnext`],
            args: [
                {
                    id: `searchInput`,
                    match: `content`
                }
            ],
            category: `music`,
            description: `Queues a YouTube song to be next in line`,
            channel: `guild`
        });
    }

    exec(message, args) {
        global.logger.info(args);
        if (args.searchInput == null) {
            return message.channel.send(new MessageEmbed()
                .setDescription(`:information_source: Please enter at least one search term or URL`)
                .setColor(`#36393f`));
        }

        queueHandler.queue(message, args.searchInput.split(` `), `playnext`);
    }
}

//! Remember to change export
module.exports = PlayNextCommand;