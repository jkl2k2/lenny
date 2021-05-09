const { Command } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);
const queueHandler = require(`../modules/queueHandler`);

class PlayNowCommand extends Command {
    constructor() {
        super(`playnow`, {
            aliases: [`playnow`, `now`],
            args: [
                {
                    id: `searchInput`,
                    match: `content`
                }
            ],
            category: `music`,
            description: `Plays a song from YouTube immediately`,
            channel: `guild`
        });
    }

    exec(message, args) {
        console.log(args);
        if (args.searchInput == null) {
            return message.channel.send(new MessageEmbed()
                .setDescription(`:information_source: Please enter at least one search term or URL`)
                .setColor(`#36393f`));
        }

        queueHandler.queue(message, args.searchInput.split(` `), `playnow`);
    }
}

//! Remember to change export
module.exports = PlayNowCommand;