const { Command } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);
const queueHandler = require(`../modules/queueHandler`);

class PlayCommand extends Command {
    constructor() {
        super(`play`, {
            aliases: [`play`, `p`],
            args: [
                {
                    id: `searchInput`,
                    match: `content`
                }
            ],
            options: [
                {
                    name: 'song',
                    type: 'STRING',
                    description: 'The URL of the song to play',
                    required: true,
                }
            ],
            category: `music`,
            description: `Plays a song from YouTube`,
            channel: `guild`,
            slash: true
        });
    }

    exec(message, args) {
        message.reply(`Please use the slash command instead`);
    }
    execSlash(message, args) {
        message.interaction.reply(`Working!`);
    }
}

module.exports = PlayCommand;