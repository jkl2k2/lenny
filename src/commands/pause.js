const { Command } = require(`discord-akairo`);
const { MessageEmbed } = require(`discord.js`);

class PauseCommand extends Command {
    constructor() {
        super(`pause`, {
            aliases: [`pause`],
            category: `music`,
            description: `Pauses playback`,
            channel: `guild`
        });
    }

    exec(message) {
        let dispatcher = message.guild.music.dispatcher;

        if (dispatcher != undefined && dispatcher.paused == false) {
            dispatcher.pause();
            message.channel.send(new MessageEmbed()
                .setDescription(`:pause_button: ${message.author.username} paused playback`)
                .setColor(`#36393f`));
        } else {
            message.channel.send(new MessageEmbed
                .setDescription(`<:cross:729019052571492434> ${message.author.username}, the music is already paused`)
                .setColor(`#FF3838`));
        }
    }
}

module.exports = PauseCommand;