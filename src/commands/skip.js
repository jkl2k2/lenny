const { Command } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);

class SkipCommand extends Command {
    constructor() {
        super(`skip`, {
            aliases: [`skip`, `s`],
            category: `music`,
            description: `Skips the currently playing song`,
            channel: `guild`
        });
    }

    exec(message) {
        if (!message.guild.music.playing) {
            return message.channel.send(new MessageEmbed()
                .setDescription(`:information_source: There is nothing to skip`)
                .setColor(`#36393f`));
        }

        if (message.guild.music.repeat) message.guild.music.repeat = false;

        if (message.guild.music.lastPlayed != undefined && message.guild.music.lastPlayed.getTitle() != undefined) {
            message.channel.send(new MessageEmbed()
                .setDescription(`:track_next: ${message.author.username} skipped **[${message.guild.music.lastPlayed.getTitle()}](${message.guild.music.lastPlayed.getURL()})**`)
                .setColor(`#36393f`));
        } else {
            message.channel.send(new MessageEmbed()
                .setDescription(`:track_next: ${message.author.username} skipped the current song`)
                .setColor(`#36393f`));
        }

        message.guild.music.dispatcher.end();
    }
}

module.exports = SkipCommand;