const { Command } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);

class SkipAllCommand extends Command {
    constructor() {
        super(`skipall`, {
            aliases: [`skipall`, `sa`, `stop`],
            category: `music`,
            description: `Skips all songs`,
            channel: `guild`
        });
    }

    exec(message) {
        // Define dispatcher;
        let dispatcher = message.guild.music.dispatcher;

        if (dispatcher == undefined || dispatcher.speaking == false) {
            return message.channel.send(new MessageEmbed()
                .setDescription(`<:cross:729019052571492434> There is nothing to skip`)
                .setColor(`#FF3838`));
        }

        // Empty queue
        message.guild.music.queue = [];

        // End dispatcher
        message.guild.music.dispatcher.end();

        // Empty dispatcher
        message.guild.music.dispatcher = undefined;

        // Reset playing
        message.guild.music.playing = false;

        message.channel.send(new MessageEmbed()
            .setDescription(`:stop_button: ${message.author.username} skipped all songs`)
            .setColor(`#36393f`));
    }
}

//! Remember to change export
module.exports = SkipAllCommand;